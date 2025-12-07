from pydantic import BaseModel
from typing import Optional

class PinResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    thumbnail_url: str
    title: Optional[str] = None