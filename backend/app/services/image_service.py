import uuid
import logging
from io import BytesIO
from datetime import datetime
from typing import List, Dict, Any, Optional
from PIL import Image
from fastapi import UploadFile, HTTPException
from app.db.supabase import supabase
from app.utils.exif_reader import extract_exif_data
from app.ml.geoclip_handler import ml_engine
from app.crud import image as crud_image
from app.crud import location as crud_location
from app.crud import tag as crud_tag
from app.schemas.image import ImageUpdate

logger = logging.getLogger(__name__)

# --- 内部ヘルパー関数 ---

async def _get_image_or_404(image_id: int, user_id: str) -> Dict[str, Any]:
    """DBから画像を取得し、存在しない場合は404エラーを投げる"""
    res = crud_image.get_image(image_id, user_id)
    if not res.data:
        raise HTTPException(status_code=404, detail="指定された画像が見つかりません。")
    return res.data


# --- メインロジック: 画像管理 ---

async def create_image(file: UploadFile, user_id: str) -> Dict[str, Any]:
    """
    画像のアップロード、EXIF解析、初期位置情報の登録を行う
    """
    content = await file.read()
    
    # EXIFデータの抽出
    try:
        with Image.open(BytesIO(content)) as img:
            lat, lon, taken_at = extract_exif_data(img)
    except Exception as e:
        logger.warning(f"EXIF extraction failed: {e}")
        lat, lon, taken_at = None, None, None

    # 地名取得 (EXIFがある場合のみ)
    geoname = ml_engine.get_geoname(lat, lon) if (lat and lon) else None
    
    # Storageへの保存
    file_path = f"{user_id}/{uuid.uuid4()}"
    try:
        supabase.storage.from_("images").upload(
            file_path, content, {"content-type": file.content_type}
        )
        url = supabase.storage.from_("images").get_public_url(file_path)
    except Exception as e:
        logger.error(f"Storage upload error: {e}")
        raise HTTPException(status_code=500, detail="画像の保存に失敗しました。")

    # DB登録 (画像基本情報)
    img_data = {
        "user_id": user_id, 
        "image_url": url, 
        "thumbnail_url": url,
        "taken_at": taken_at.isoformat() if taken_at else None,
        "location_status": "EXIF_PRESENT" if (lat and lon) else "NO_GPS"
    }
    new_image = crud_image.insert_image(img_data).data[0]

    # DB登録 (位置情報)
    if lat and lon:
        crud_location.insert_location({
            "image_id": new_image["id"], 
            "latitude": lat, 
            "longitude": lon,
            "geoname": geoname, 
            "source_type": "EXIF", 
            "geom": f"POINT({lon} {lat})"
        })

    return {**new_image, "latitude": lat, "longitude": lon, "geoname": geoname}


async def get_image_detail(image_id: int, user_id: str) -> Dict[str, Any]:
    """
    画像の詳細情報（位置、タグを含む）を取得する
    """
    image = await _get_image_or_404(image_id, user_id)
    
    # 位置情報の統合
    loc_res = crud_location.get_location_by_image(image_id)
    loc_data = loc_res.data if loc_res and loc_res.data else {}
    
    image.update({
        "latitude": loc_data.get("latitude"),
        "longitude": loc_data.get("longitude"),
        "geoname": loc_data.get("geoname")
    })
    
    # タグ情報の取得
    image["tags"] = crud_tag.get_tags_by_image(image_id)
    
    return image


async def get_images_list(user_id: str, limit: int = 20, offset: int = 0) -> List[Dict]:
    """ユーザーの画像一覧を取得"""
    res = crud_image.get_images_list(user_id, limit, offset)
    return res.data


async def delete_image(image_id: int, user_id: str) -> bool:
    """DBとStorageの両方から画像を削除する"""
    image = await _get_image_or_404(image_id, user_id)
    
    # DBからの削除
    crud_image.delete_image(image_id, user_id)
    
    # Storageからの物理削除
    try:
        url = image["image_url"]
        file_path = url.split("/public/images/")[1] 
        supabase.storage.from_("images").remove(file_path)
    except Exception as e:
        logger.error(f"Storage cleanup failed for {image_id}: {e}")
        # Storage削除失敗でもDB側が消えていればAPIとしては成功とする
    
    return True


# --- メインロジック: 位置解析・確定 ---

async def analyze_image_location(image_id: int, user_id: str) -> Dict[str, Any]:
    """AIを用いて画像の位置を推論し、候補を保存する"""
    image = await _get_image_or_404(image_id, user_id)
    
    # MLエンジンで候補算出
    candidates = await ml_engine.predict_location(image["image_url"])
    
    # 候補データの保存用整形
    c_data = [{
        "image_id": image_id, 
        "candidate_index": c["index"], 
        "latitude": c["latitude"], 
        "longitude": c["longitude"], 
        "confidence_score": c["confidence"], 
        "geoname": c["geoname"]
    } for c in candidates]
    
    crud_location.save_candidates(image_id, c_data)
    crud_image.update_status(image_id, "AI_CANDIDATE")
    
    return {"status": "AI_CANDIDATE", "candidates": candidates}

async def get_location_candidates(image_id: int, user_id: str) -> List[Dict]:
    """
    保存されているAI解析の候補リストを取得する
    """
    # 画像の存在と所有権を確認
    await _get_image_or_404(image_id, user_id)
    
    # CRUD経由で候補データを取得
    res = crud_location.get_candidates(image_id)
    return res.data if res and res.data else []

async def confirm_location(image_id: int, candidate_id: int, user_id: str) -> Dict[str, str]:
    """選択された候補を確定位置として登録する"""
    try:
        cand_res = crud_location.get_candidate_by_id(image_id, candidate_id)
        if not cand_res.data:
            raise HTTPException(status_code=404, detail="指定された候補が見つかりません。")
        
        cand = cand_res.data
        
        # 位置本登録
        crud_location.insert_location({
            "image_id": image_id, 
            "latitude": cand["latitude"], 
            "longitude": cand["longitude"],
            "geoname": cand["geoname"], 
            "source_type": "AI推定", 
            "confidence_score": cand["confidence_score"],
            "geom": f"POINT({cand['longitude']} {cand['latitude']})"
        })
        
        # ステータス更新と候補データの掃除
        crud_image.update_status(image_id, "CONFIRMED")
        crud_location.delete_candidates(image_id)
        
        return {"status": "CONFIRMED"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Confirmation error: {e}")
        raise HTTPException(status_code=400, detail="位置の確定処理に失敗しました。")


async def reanalyze_location(image_id: int, user_id: str) -> Dict[str, Any]:
    """既存の候補を削除して再解析を行う"""
    crud_location.delete_candidates(image_id)
    return await analyze_image_location(image_id, user_id)


# --- メインロジック: 情報更新 ---

async def update_image_info(image_id: int, user_id: str, update_in: ImageUpdate) -> Dict[str, Any]:
    """メタデータとお気に入り状態、およびタグを更新する"""
    await _get_image_or_404(image_id, user_id)
    
    # 基本情報の更新
    update_data = update_in.model_dump(exclude={"tags"}, exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now().isoformat()
        crud_image.update_image(image_id, user_id, update_data)

    # タグの同期
    if update_in.tags is not None:
        crud_tag.sync_tags(image_id, update_in.tags)
    
    return await get_image_detail(image_id, user_id)