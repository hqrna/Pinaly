from typing import List
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query, Path, Body

from app.api import deps
from app.services import image_service
from app.schemas.image import ImageResponse, ImageUpdate

router = APIRouter()

# ------------------------------------------------------------------
# 画像の基本操作 (CRUD)
# ------------------------------------------------------------------

@router.post(
    "", 
    response_model=ImageResponse, 
    status_code=201,
    summary="画像のアップロード",
    description="画像ファイルを受け取り、ストレージ保存とEXIF情報の解析を行います。"
)
async def create_image(
    file: UploadFile = File(...),
    current_user = Depends(deps.get_current_user)
):
    return await image_service.create_image(file, current_user.id)


@router.get(
    "", 
    response_model=List[ImageResponse],
    summary="ギャラリー一覧の取得",
    description="ログインユーザーが所有する画像を一覧で取得します（ページネーション対応）。"
)
async def read_images(
    limit: int = Query(20, ge=1, le=100, description="取得件数"),
    offset: int = Query(0, ge=0, description="スキップ件数"),
    current_user = Depends(deps.get_current_user)
):
    return await image_service.get_images_list(current_user.id, limit, offset)


@router.get(
    "/{id}", 
    response_model=ImageResponse,
    summary="画像詳細の取得",
    description="IDに基づき、位置情報やタグを含む画像の詳細情報を取得します。"
)
async def read_image_detail(
    id: int = Path(..., description="画像ID"),
    current_user = Depends(deps.get_current_user)
):
    return await image_service.get_image_detail(id, current_user.id)


@router.put(
    "/{id}", 
    response_model=ImageResponse,
    summary="画像情報の更新",
    description="タイトル、コメント、お気に入りフラグ、およびタグ情報を更新します。"
)
async def update_image(
    id: int,
    image_in: ImageUpdate,
    current_user = Depends(deps.get_current_user)
):
    return await image_service.update_image_info(id, current_user.id, image_in)


@router.delete(
    "/{id}", 
    status_code=204,
    summary="画像の削除",
    description="DBレコードとStorage上の実ファイルを削除します。"
)
async def delete_image(
    id: int,
    current_user = Depends(deps.get_current_user)
):
    await image_service.delete_image(id, current_user.id)
    return


# ------------------------------------------------------------------
# AI 位置推定関連 (ML)
# ------------------------------------------------------------------

@router.post(
    "/{id}/analyze", 
    status_code=200,
    summary="AI解析の実行",
    description="GeoCLIPを使用して、画像から撮影場所を推論します。"
)
async def analyze_image(
    id: int = Path(..., description="対象の画像ID"),
    current_user = Depends(deps.get_current_user)
):
    return await image_service.analyze_image_location(id, current_user.id)


@router.get(
    "/{id}/candidates", 
    response_model=List[dict],
    summary="推定候補の取得",
    description="実行済みのAI解析結果（位置候補リスト）を取得します。"
)
async def get_image_candidates(
    id: int = Path(..., description="画像ID"),
    current_user = Depends(deps.get_current_user)
):
    return await image_service.get_location_candidates(id, current_user.id)


@router.post(
    "/{id}/confirm", 
    status_code=200,
    summary="位置情報の確定",
    description="提示された候補の中から1つを選択し、正式な位置情報として登録します。"
)
async def confirm_image_location(
    id: int = Path(..., description="画像ID"),
    candidate_id: int = Body(..., embed=True, description="確定する候補のID"),
    current_user = Depends(deps.get_current_user)
):
    return await image_service.confirm_location(id, candidate_id, current_user.id)


@router.post(
    "/{id}/reanalyze", 
    status_code=200,
    summary="AI再解析の実行",
    description="既存の候補を破棄し、再度AI解析を行います。"
)
async def reanalyze_image(
    id: int = Path(..., description="画像ID"),
    current_user = Depends(deps.get_current_user)
):
    return await image_service.reanalyze_location(id, current_user.id)