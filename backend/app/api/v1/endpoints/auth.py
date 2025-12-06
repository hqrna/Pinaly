from fastapi import APIRouter, HTTPException, status, Depends
from app.models.auth import UserRegister, UserLogin, Token
from app.db.supabase import supabase
from app.api import deps
from supabase_auth.errors import AuthApiError # エラーハンドリング
from fastapi.security import OAuth2PasswordRequestForm # <--- これを追加

router = APIRouter()

# ------------------------------------------------------------------
# 🔓 Public Endpoints (門番なし：誰でもOK)
# ------------------------------------------------------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister):
    try:
        res = supabase.auth.sign_up({
            "email": user.email, 
            "password": user.password,
            "options": {"data": {"name": user.name}}
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Registration failed")
        return {"message": "User created successfully", "user_id": res.user.id}
    except AuthApiError as e:
        #Supabase側のエラー
        print(f"Supabase Auth Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    except Exception as e:
        #その他のエラー
        print(f"Unkenown Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/login", response_model=Token)
def login(user: UserLogin):
    # (中身はそのまま)
    try:
        res = supabase.auth.sign_in_with_password({
            "email": user.email, 
            "password": user.password
        })
        return {
            "access_token": res.session.access_token,
            "token_type": "bearer"
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/access-token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Swaggerは "email" ではなく "username" という名前で送ってくる仕様なので、
    # form_data.username を email として扱います
    res = supabase.auth.sign_in_with_password({
        "email": form_data.username,
        "password": form_data.password,
    })

    if not res.user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    return {"access_token": res.session.access_token, "token_type": "bearer"}

# ------------------------------------------------------------------
# 🔒 Protected Endpoints (門番あり：ログイン必須)
# ------------------------------------------------------------------

@router.post("/logout", dependencies=[Depends(deps.get_current_user)])
def logout():
    """
    ログアウト処理。
    ログインしていない人（トークンが無効な人）はこの関数に入ることさえできず、
    deps.py が勝手に 401 エラーを返します。
    """
    try:
        supabase.auth.sign_out()
        return {"message": "Logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
def read_users_me(current_user = Depends(deps.get_current_user)):
    """
    テスト用: 自分のユーザー情報を返す。
    deps.get_current_user が返したユーザー情報が、そのまま引数に入ってきます。
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        # メタデータから名前を取得（無ければ空文字）
        "name": current_user.user_metadata.get("name", "")
    }