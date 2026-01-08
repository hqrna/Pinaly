import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

// ------------------------------------------------------------------
// Layout：サイドバー（Header）を含むメインアプリケーションの共通枠
// ------------------------------------------------------------------

export const Layout = () => {

  // --- Render ---
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

      {/* サイドバーナビゲーション */}      
      <Sidebar />

      {/* メインコンテンツエリア(各ページがOutletに描画される) */}
      <main style={{ width: '100%', height: '100%' }}>
        <Outlet />
      </main>

    </div>
  );
};