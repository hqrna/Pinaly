from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .tag import TagResponse

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
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True

# PUTリクエスト用
class ImageUpdate(BaseModel):
    title: Optional[str] = None
    comment: Optional[str] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None