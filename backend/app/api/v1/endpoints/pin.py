from typing import List
from fastapi import APIRouter, Query, Depends
from app.api import deps
from app.db.supabase import supabase
from app.schemas.pin import PinResponse

router = APIRouter()

@router.get("/images", response_model=List[PinResponse])
async def get_map_pins(
    min_lat: float = Query(..., description="表示範囲の南端"),
    max_lat: float = Query(..., description="表示範囲の北端"),
    min_lon: float = Query(..., description="表示範囲の西端"),
    max_lon: float = Query(..., description="表示範囲の東端"),
    current_user = Depends(deps.get_current_user)
):
    """
    指定された地図範囲内にある画像ピンを取得する。
    """
    # 範囲検索 + ユーザーフィルタ
    res = supabase.table("locations")\
        .select("latitude, longitude, images!inner(id, thumbnail_url, title, location_status, user_id)")\
        .gte("latitude", min_lat)\
        .lte("latitude", max_lat)\
        .gte("longitude", min_lon)\
        .lte("longitude", max_lon)\
        .eq("images.user_id", current_user.id)\
        .in_("images.location_status", ["EXIF_PRESENT", "CONFIRMED", "USER_MANUAL"])\
        .execute()
        
    pins = []
    for item in res.data:
        img = item.get("images")
        if img:
            pins.append({
                "id": img["id"],
                "latitude": item["latitude"],
                "longitude": item["longitude"],
                "thumbnail_url": img["thumbnail_url"],
                "title": img.get("title")
            })
            
    return pins