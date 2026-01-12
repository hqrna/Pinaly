from app.db.supabase import supabase

def get_image(image_id: int, user_id: str):
    return supabase.table("images").select("*").eq("id", image_id).eq("user_id", user_id).single().execute()

def get_images_list(user_id: str, limit: int, offset: int):
    return supabase.table("images")\
        .select("*")\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .range(offset, offset + limit - 1)\
        .execute()

def insert_image(data: dict):
    return supabase.table("images").insert(data).execute()

def update_image(image_id: int, user_id: str, data: dict):
    return supabase.table("images").update(data).eq("id", image_id).eq("user_id", user_id).execute()

def update_status(image_id: int, status: str):
    return supabase.table("images").update({"location_status": status}).eq("id", image_id).execute()

def delete_image(image_id: int, user_id: str):
    return supabase.table("images").delete().eq("id", image_id).eq("user_id", user_id).execute()