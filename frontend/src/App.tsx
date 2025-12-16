import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MapPage } from './pages/MapPage';
import { type ReactNode } from 'react';

// ------------------------------------------------------------------
// PrivateRoute：ログイン必須ルートの制御
// ------------------------------------------------------------------

const PrivateRoute = ({ children }: { children: ReactNode}) => {
  const { user, loading } = useAuth();

  // 認証チェック中はローディング表示（必要に応じてスピナー等に変更可）
  if (loading) return <div>Loading...</div>;

  // 未ログインならログイン画面へ転送、ログイン済みなら中身を表示
  return user ? children : <Navigate to="/login" />;
};

// ------------------------------------------------------------------
// App：ルーティング定義とプロバイダーの構成
// ------------------------------------------------------------------
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* --- 公開ルート（未ログインでもアクセス可） --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* --- 保護されたルート（ログイン必須） --- */}
          <Route path="/" element={
            <PrivateRoute>
              <MapPage /> 
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;