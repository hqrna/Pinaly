#ルーターの集約場所
from fastapi import APIRouter
from app.api.v1.endpoints import auth, images, maps

api_router = APIRouter()

# ここで各機能を統合
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
# api_router.include_router(images.router, prefix="/images", tags=["images"])
# api_router.include_router(maps.router, prefix="/maps", tags=["maps"])