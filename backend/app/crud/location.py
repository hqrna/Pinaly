from app.db.supabase import supabase

def get_location_by_image(image_id: int):
    return supabase.table("locations").select("*").eq("image_id", image_id).maybe_single().execute()

def insert_location(data: dict):
    return supabase.table("locations").insert(data).execute()

def get_candidates(image_id: int):
    return supabase.table("location_candidates").select("*").eq("image_id", image_id).order("candidate_index").execute()

def get_candidate_by_id(image_id: int, candidate_id: int):
    return supabase.table("location_candidates").select("*").eq("id", candidate_id).eq("image_id", image_id).single().execute()

def save_candidates(image_id: int, candidate_data: list):
    supabase.table("location_candidates").delete().eq("image_id", image_id).execute()
    return supabase.table("location_candidates").insert(candidate_data).execute()

def delete_candidates(image_id: int):
    return supabase.table("location_candidates").delete().eq("image_id", image_id).execute()