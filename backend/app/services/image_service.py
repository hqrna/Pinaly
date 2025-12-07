import uuid
from datetime import datetime
from typing import List, Optional
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from fastapi import UploadFile, HTTPException
from app.db.supabase import supabase
from app.schemas.image import ImageUpdate
# 対応画像形式
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

# --- 既存のヘルパー関数 (_get_decimal_from_dms, extract_exif_data) は省略せず残してください ---
def _get_decimal_from_dms(dms, ref):
    # (前回と同じコード)
    degrees = dms[0]
    minutes = dms[1]
    seconds = dms[2]
    decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
    if ref in ['S', 'W']:
        decimal = -decimal
    return decimal

def extract_exif_data(image: Image.Image):
    # (前回と同じコード)
    exif_data = image._getexif()
    if not exif_data:
        return None, None, None
    gps_info = {}
    taken_at = None
    for tag, value in exif_data.items():
        tag_name = TAGS.get(tag, tag)
        if tag_name == "DateTimeOriginal":
            try:
                taken_at = datetime.strptime(value, "%Y:%m:%d %H:%M:%S")
            except:
                pass
        if tag_name == "GPSInfo":
            for t in value:
                sub_tag = GPSTAGS.get(t, t)
                gps_info[sub_tag] = value[t]
    lat = None
    lon = None
    if gps_info:
        if "GPSLatitude" in gps_info and "GPSLatitudeRef" in gps_info:
            lat = _get_decimal_from_dms(gps_info["GPSLatitude"], gps_info["GPSLatitudeRef"])
        if "GPSLongitude" in gps_info and "GPSLongitudeRef" in gps_info:
            lon = _get_decimal_from_dms(gps_info["GPSLongitude"], gps_info["GPSLongitudeRef"])
    return lat, lon, taken_at

# --- ① 画像アップロード (POST /api/v1/images) 用 ---
async def create_image(file: UploadFile, user_id: str):
    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type")

    try:
        content = await file.read()
        from io import BytesIO
        image_stream = BytesIO(content)
        
        with Image.open(image_stream) as img:
            lat, lon, taken_at = extract_exif_data(img)
            # 設計要件: GPS有無に応じて分岐
            # EXIFがあれば location_status="EXIF_PRESENT", なければ "NO_GPS"
        
        file_path = f"{user_id}/{uuid.uuid4()}.{ext}"
        bucket_name = "images"

        # Storageへアップロード
        supabase.storage.from_(bucket_name).upload(
            path=file_path,
            file=content,
            file_options={"content-type": file.content_type}
        )
        public_url_res = supabase.storage.from_(bucket_name).get_public_url(file_path)
        
        # DB登録
        image_data = {
            "user_id": user_id,
            "image_url": public_url_res,
            "thumbnail_url": public_url_res,
            "taken_at": taken_at.isoformat() if taken_at else None,
            "location_status": "EXIF_PRESENT" if (lat and lon) else "NO_GPS",
            "is_favorite": False
        }
        
        img_res = supabase.table("images").insert(image_data).execute()
        new_image = img_res.data[0]
        image_id = new_image["id"]

        # GPSがある場合のみ locations に登録
        if lat is not None and lon is not None:
            location_data = {
                "image_id": image_id,
                "latitude": lat,
                "longitude": lon,
                "source_type": "EXIF",
                "geom": f"POINT({lon} {lat})"
            }
            supabase.table("locations").insert(location_data).execute()

        # レスポンス用に結合データを整形
        return {
            **new_image,
            "latitude": lat,
            "longitude": lon
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

# --- ② ギャラリー取得 (GET /api/v1/images) 用 ---
async def get_images_list(user_id: str, limit: int = 20, offset: int = 0):
    # ユーザーの画像をページネーション付きで取得
    res = supabase.table("images")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .range(offset, offset + limit - 1)\
        .execute()
    return res.data

# --- ③ 詳細取得 (GET /api/v1/images/{id}) 用 ---
async def get_image_detail(image_id: int, user_id: str):
    # locations情報も結合して取得したいが、Supabase py clientの結合は少し癖があるため
    # まずimageを取得し、必要ならlocationを引く形が確実
    img_res = supabase.table("images").select("*").eq("id", image_id).eq("user_id", user_id).single().execute()
    
    if not img_res.data:
        raise HTTPException(status_code=404, detail="Image not found")
    
    image = img_res.data
    
    # 関連するlocationを取得
    loc_res = supabase.table("locations").select("*").eq("image_id", image_id).maybe_single().execute()
    
    # データを結合
    if loc_res.data:
        image["latitude"] = loc_res.data["latitude"]
        image["longitude"] = loc_res.data["longitude"]
        image["geoname"] = loc_res.data["geoname"]
        image["address"] = loc_res.data.get("address") # DB設計にあれば
    
    return image

# --- ④ 画像削除 (DELETE /api/v1/images/{id}) 用 ---
async def delete_image(image_id: int, user_id: str):
    # まず画像の存在確認と所有権確認
    img_res = supabase.table("images").select("image_url").eq("id", image_id).eq("user_id", user_id).single().execute()
    if not img_res.data:
        raise HTTPException(status_code=404, detail="Image not found")
    
    # DBから削除 (Cascade設定しているので locations なども自動で消えるはずだが、Storageは消えない)
    supabase.table("images").delete().eq("id", image_id).eq("user_id", user_id).execute()
    
    # Storageから削除 (URLからパスを抽出するロジックが必要)
    # 例: https://.../storage/v1/object/public/photos/USER_ID/UUID.jpg
    try:
        url = img_res.data["image_url"]
        # バケツ名以降のパスを取得
        file_path = url.split("/public/photos/")[1] 
        supabase.storage.from_("photos").remove(file_path)
    except:
        pass # Storage削除失敗はログに残す程度で、APIとしては成功を返す運用が多い
    
    return True

def _update_image_tags(image_id: int, tag_names: List[str]):
    """
    画像に紐付くタグを更新する。
    1. 既存のタグ紐付けを削除
    2. 入力されたタグ名が tags テーブルになければ作成
    3. image_tags テーブルに紐付けを作成
    """
    if tag_names is None:
        return

    # 1. 既存の紐付けを全削除 (洗い替え)
    supabase.table("image_tags").delete().eq("image_id", image_id).execute()

    if not tag_names:
        return

    # 2. タグIDの解決 (Find or Create)
    tag_ids = []
    
    # 既存タグを一括取得
    existing_tags = supabase.table("tags").select("id, name").in_("name", tag_names).execute()
    existing_map = {t["name"]: t["id"] for t in existing_tags.data}

    for name in tag_names:
        name = name.strip()
        if not name:
            continue
            
        if name in existing_map:
            tag_ids.append(existing_map[name])
        else:
            # 新規作成
            # (注意: tagsテーブルのポリシーによっては insert 権限が必要)
            res = supabase.table("tags").insert({"name": name}).execute()
            if res.data:
                tag_ids.append(res.data[0]["id"])
    
    # 3. 新しい紐付けを登録
    if tag_ids:
        insert_data = [{"image_id": image_id, "tag_id": tid} for tid in tag_ids]
        supabase.table("image_tags").insert(insert_data).execute()


# --- 修正: 詳細取得 (タグ情報も取得するように変更) ---
async def get_image_detail(image_id: int, user_id: str):
    # 画像本体
    img_res = supabase.table("images").select("*").eq("id", image_id).eq("user_id", user_id).single().execute()
    if not img_res.data:
        raise HTTPException(status_code=404, detail="Image not found")
    
    image = img_res.data
    
    # Locations結合
    loc_res = supabase.table("locations").select("*").eq("image_id", image_id).maybe_single().execute()
    if loc_res.data:
        image["latitude"] = loc_res.data["latitude"]
        image["longitude"] = loc_res.data["longitude"]
        image["geoname"] = loc_res.data["geoname"]

    # ★追加: Tags結合
    # Supabaseの結合クエリで tags を取得する
    tags_res = supabase.table("image_tags").select("tag_id, tags(id, name)").eq("image_id", image_id).execute()
    
    # データ整形: [{"tag_id": 1, "tags": {"id": 1, "name": "..."}}] -> [{"id": 1, "name": "..."}]
    image["tags"] = [item["tags"] for item in tags_res.data if item.get("tags")]
    
    return image


# --- 追加: 画像情報更新 (PUT対応) ---
async def update_image_info(image_id: int, user_id: str, update_in: ImageUpdate):
    # まず更新データ作成
    data = update_in.model_dump(exclude={"tags"}, exclude_unset=True) # tagsは別処理
    
    if data:
        data["updated_at"] = datetime.now().isoformat()
        res = supabase.table("images").update(data).eq("id", image_id).eq("user_id", user_id).execute()
        if not res.data:
             raise HTTPException(status_code=404, detail="Image not found")

    # タグの更新 (tagsフィールドが含まれている場合のみ)
    if update_in.tags is not None:
        _update_image_tags(image_id, update_in.tags)
    
    # 更新後の最新状態を返す
    return await get_image_detail(image_id, user_id)