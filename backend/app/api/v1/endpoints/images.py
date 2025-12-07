from datetime import datetime
from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query, Path, Body
from app.api import deps
from app.services import image_service
from app.schemas.image import ImageResponse, ImageUpdate

router = APIRouter()

# ------------------------------------------------------------------
# ① 画像アップロード (F-02)
# 設計: POST /api/v1/images
# ------------------------------------------------------------------
@router.post("", response_model=ImageResponse, status_code=201)
async def create_image(
    file: UploadFile = File(...),
    current_user = Depends(deps.get_current_user)
):
    """
    画像ファイルを受け付け、ストレージに保存。
    GPS有無に応じてDBを作成 (location_status: EXIF_PRESENT or NO_GPS)
    """
    return await image_service.create_image(file, current_user.id)

# ------------------------------------------------------------------
# ② ギャラリー取得 (F-08)
# 設計: GET /api/v1/images
# ------------------------------------------------------------------
@router.get("", response_model=List[ImageResponse])
async def read_images(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user = Depends(deps.get_current_user)
):
    """
    登録済みの全画像を一覧取得（ページネーション対応）
    """
    return await image_service.get_images_list(current_user.id, limit, offset)

# ------------------------------------------------------------------
# ③ 詳細情報取得 (F-06)
# 設計: GET /api/v1/images/{id}
# ------------------------------------------------------------------
@router.get("/{id}", response_model=ImageResponse)
async def read_image_detail(
    id: int = Path(..., title="The ID of the image to get"),
    current_user = Depends(deps.get_current_user)
):
    """
    特定の画像IDに基づき、詳細情報を取得
    """
    return await image_service.get_image_detail(id, current_user.id)

# ------------------------------------------------------------------
# ④ 画像更新 (F-07)
# 設計: PUT /api/v1/images/{id}
# ------------------------------------------------------------------
@router.put("/{id}", response_model=ImageResponse)
async def update_image(
    id: int,
    image_in: ImageUpdate,
    current_user = Depends(deps.get_current_user)
):
    """
    画像のメタ情報（タイトル、コメント、お気に入り等）を更新
    ※ 今回はservice層に関数を作らずここでsupabaseを呼ぶ簡易実装例
    """
    # 詳細情報を再取得して返す（locations情報なども含めるため）
    return await image_service.update_image_info(id, current_user.id, image_in)

# ------------------------------------------------------------------
# ⑤ 画像削除 (F-07)
# 設計: DELETE /api/v1/images/{id}
# ------------------------------------------------------------------
@router.delete("/{id}", status_code=204)
async def delete_image(
    id: int,
    current_user = Depends(deps.get_current_user)
):
    """
    画像データと関連DBレコードを削除
    """
    await image_service.delete_image(id, current_user.id)
    return # 204 No Content