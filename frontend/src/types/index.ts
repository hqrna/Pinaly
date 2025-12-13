// --- APIエラーレスポンスの型定義
export type ApiError = {
  response?: {
    data?: {
      detail?: string;
    };
  };
};

// --- ユーザー情報の定義 ---
export interface User {
  id: string;
  email: string;
  name: string;
}

// --- ログインAPIのレスポンス ---
export type AuthResponse = {
  access_token: string;
  token_type: string;
};

// --- AuthContextで提供される機能とデータの型定義 ---
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// --- ユーザー登録フォームの入力値 ---
export type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
};

// --- ログインフォームの入力値 ---
export type LoginFormInputs = {
  email: string;
  password: string;
};

// --- マップ上に表示するピン（画像）の情報 ---
export interface Pin {
  id: number;
  latitude: number;
  longitude: number;
  thumbnail_url: string;
  title: string | null;
}

// 画像アップロードフォームの入力値 ---
export type UploadFormInputs = {
  file: FileList;
};
