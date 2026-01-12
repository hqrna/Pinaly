from typing import List
from app.db.supabase import supabase

def get_tags_by_image(image_id: int):
    res = supabase.table("image_tags").select("tag_id, tags(id, name)").eq("image_id", image_id).execute()
    return [item["tags"] for item in res.data if item.get("tags")]

def sync_tags(image_id: int, tag_names: List[str]):
    # 既存の紐付けを削除
    supabase.table("image_tags").delete().eq("image_id", image_id).execute()
    if not tag_names:
        return

    # タグのID解決 (Find or Create)
    existing_tags = supabase.table("tags").select("id, name").in_("name", tag_names).execute()
    existing_map = {t["name"]: t["id"] for t in existing_tags.data}

    tag_ids = []
    for name in tag_names:
        name = name.strip()
        if not name: continue
        if name in existing_map:
            tag_ids.append(existing_map[name])
        else:
            new_tag = supabase.table("tags").insert({"name": name}).execute()
            if new_tag.data:
                tag_ids.append(new_tag.data[0]["id"])
    
    # 新規紐付け
    if tag_ids:
        insert_data = [{"image_id": image_id, "tag_id": tid} for tid in tag_ids]
        supabase.table("image_tags").insert(insert_data).execute()