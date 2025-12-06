from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.db.supabase import supabase

# Swagger UIで "Authorize" ボタンを表示させるための設定
# トークンを受け取るURLを指定（今回は仮で/loginとしていますが、実際はSupabaseが発行します）
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/access-token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    リクエストヘッダーの "Authorization: Bearer <token>" からトークンを取り出し、
    Supabaseに問い合わせてユーザー情報を返す。
    無効なら 401 エラーを発生させて、APIの中身は実行させない。
    """
    try:
        # Supabaseを使ってトークンを検証＆ユーザー情報取得
        user_response = supabase.auth.get_user(token)
        
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_response.user

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )