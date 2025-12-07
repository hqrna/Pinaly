#ルーターの集約場所
from fastapi import APIRouter
from app.api.v1.endpoints import auth, images, pin, tags

api_router = APIRouter()

# ここで各機能を統合
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(pin.router, prefix="/pin", tags=["pin"])
api_router.include_router(tags.router, prefix="/tags", tags=["tags"])