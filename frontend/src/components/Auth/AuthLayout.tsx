import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';
import type { AuthLayoutProps } from '../../types';

// ------------------------------------------------------------------
// AuthLayout：認証関連ページ（ログイン・登録等）の共通外枠レイアウト
// ------------------------------------------------------------------

export const AuthLayout = ({ 
  subtitle, 
  children, 
  footerText, 
  footerLinkText, 
  footerLinkTo 
}: AuthLayoutProps) => {

  // --- Render ---
  return (
    <div className={styles.background}>
      <div className={styles.card}>
      
        {/* ヘッダー共通部分 */}
        <div className={styles.header}>
          <h1 className={styles.logo}>Pinaly</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* 各ページ固有のコンテンツ(フォーム等) */}
        {children}

        {/* フッター共通部分(リンクエリア) */}
        <div className={styles.linkContainer}>
          {footerText}
          <Link to={footerLinkTo} className={styles.link}>
            {footerLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
};