import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../lib/axios';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ------------------------------------------------------------------
// AuthProvider：アプリケーション全体に認証状態（ユーザー情報、ログイン/ログアウト機能）を実装。
// ------------------------------------------------------------------

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初期化処理
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch {
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ログイン処理
  const login = async (token: string) => {
    localStorage.setItem('access_token', token);
    const res = await api.get<User>('/auth/me');
    setUser(res.data);
  };

  // ログアウト処理
  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    api.post('/auth/logout').catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ------------------------------------------------------------------
// Custom Hook
// ------------------------------------------------------------------

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};