// src/types/index.ts

// 共通のエラー型（RegisterPageなどでも使えるように共通化）
export type ApiError = {
  response?: {
    data?: {
      detail?: string;
    };
  };
};

// ユーザー登録用の型（先ほどの実装分もここに入れると良いです）
export type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
};

// ログインフォーム用
export type LoginFormInputs = {
  email: string;
  password: string;
};

// ログインAPIのレスポンス用 (バックエンドの返却値に合わせる)
export type AuthResponse = {
  access_token: string;
  token_type: string;
};

// 画像アップロード用のフォーム入力型
export type UploadFormInputs = {
  file: FileList;
};

export interface Pin {
  id: number;
  latitude: number;
  longitude: number;
  thumbnail_url: string;
  title: string | null;
}