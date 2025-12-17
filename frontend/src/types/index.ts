import type { ReactNode } from 'react';

// ------------------------------------------------------------------
// types/index.ts：プロジェクト全体の共通型定義
// ------------------------------------------------------------------

// --- 認証・ユーザー関連 ---
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

// --- APIレスポンス関連 ---
export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export type ApiError = {
  response?: {
    data?: {
      detail?: string;
    };
  };
};

// --- マップ・データ関連 ---
export interface Pin {
  id: number;
  latitude: number;
  longitude: number;
  thumbnail_url: string;
  title: string | null;
}

// --- フォーム入力値 (React Hook Form) ---
export type LoginFormInputs = {
  email: string;
  password: string;
};

export type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
};

export type UploadFormInputs = {
  file: FileList;
};

// --- コンポーネントProps関連 ---
export type AuthLayoutProps = {
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerLinkText: string;
  footerLinkTo: string;
};