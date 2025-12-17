import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';
import { 
  Menu, 
  ChevronLeft, 
  User, 
  Image as ImageIcon,
  Settings, 
  LogOut 
} from 'lucide-react';

// ------------------------------------------------------------------
// Header：サイドバー形式のナビゲーションメニュー
// ------------------------------------------------------------------

export const Header = () => {

  // --- Hooks & States ---
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();

  // --- Handlers ---
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // アイコンの基本サイズ
  const ICON_SIZE = 24;

  // --- Render ---
  return (
    <>
      <nav className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        
        {/* ヘッダーエリア：トグルボタン ＋ ロゴ */}
        <div className={styles.sidebarHeader}>
          <button 
            className={styles.toggleButton} 
            onClick={toggleMenu}
            aria-label={isOpen ? "メニューを縮小" : "メニューを展開"}
          >
            {isOpen ? <ChevronLeft size={28} /> : <Menu size={28} />}
          </button>

          <Link to="/" className={styles.logo}>
            Pinaly
          </Link>
        </div>

        {/* プロフィールエリア */}
        <div className={styles.profileSection}>
          <div className={styles.navIcon}>
             <User size={ICON_SIZE} />
          </div>
          <span className={styles.navLabel} style={{ fontWeight: 'bold', color: '#334155' }}>
            ユーザー名
          </span>
        </div>

        {/* ナビゲーションリスト */}
        <ul className={styles.navList}>
          <li>
            <Link to="/album" className={styles.navItem}>
              <div className={styles.navIcon}>
                <ImageIcon size={ICON_SIZE} />
              </div>
              <span className={styles.navLabel}>アルバム</span>
            </Link>
          </li>
          <li>
            <Link to="/settings" className={styles.navItem}>
              <div className={styles.navIcon}>
                <Settings size={ICON_SIZE} />
              </div>
              <span className={styles.navLabel}>設定</span>
            </Link>
          </li>
        </ul>

        {/* フッターエリア（ログアウト） */}
        <div className={styles.sidebarFooter}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            <div className={styles.navIcon}>
              <LogOut size={ICON_SIZE} />
            </div>
            <span className={styles.navLabel}>ログアウト</span>
          </button>
        </div>
        
      </nav>
    </>
  );
};