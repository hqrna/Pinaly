import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './pages/Login/index';
import { RegisterPage } from './pages/Register/index';
import { MapPage } from './pages/Map/index';
import { type ReactNode } from 'react';
import { Layout } from './components/Layout/Layout';

// ------------------------------------------------------------------
// PrivateRoute：ログイン必須ルートの制御
// ------------------------------------------------------------------

const PrivateRoute = ({ children }: { children: ReactNode}) => {
  const { user, loading } = useAuth();

  // 認証チェック中はローディング表示
  if (loading) return <div>Loading...</div>;

  // 未ログインならログイン画面へ転送
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
          <Route
            element={
              // ログイン済みチェック → OKなら Layout を表示
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* メインコンテンツ(Layout内のOutletに表示) */}
            <Route path="/" element={<MapPage />} />

            {/* 将来的な追加ページ（アルバム、設定等）はここに追加 */}

          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;