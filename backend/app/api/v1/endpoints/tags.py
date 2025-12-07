from typing import List
from fastapi import APIRouter, Depends
from app.api import deps
from app.db.supabase import supabase
from app.schemas.tag import TagResponse

router = APIRouter()

@router.get("", response_model=List[TagResponse])
async def read_tags(
    current_user = Depends(deps.get_current_user)
):
    """
    登録されている全タグを取得する（入力補完用）
    """
    res = supabase.table("tags").select("*").order("name").execute()
    return res.data