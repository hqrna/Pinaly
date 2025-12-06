from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# 共通: 画像情報のベース
class ImageBase(BaseModel):
    title: Optional[str] = None
    comment: Optional[str] = None
    is_favorite: bool = False

# POSTレスポンス / 詳細取得用
class ImageResponse(ImageBase):
    id: int
    image_url: str
    thumbnail_url: Optional[str] = None
    location_status: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geoname: Optional[str] = None
    taken_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# PUTリクエスト用 (更新できる項目のみ)
class ImageUpdate(BaseModel):
    title: Optional[str] = None
    comment: Optional[str] = None
    is_favorite: Optional[bool] = None