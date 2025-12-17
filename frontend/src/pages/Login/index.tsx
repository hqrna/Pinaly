import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLayout } from '../../components/Auth/AuthLayout';
import type { LoginFormInputs, AuthResponse } from '../../types';
import styles from '../../styles/AuthForm.module.css';

// ------------------------------------------------------------------
// LoginPage：ログイン認証を行うページ
// ------------------------------------------------------------------

export const LoginPage = () => {

  // --- Hooks & States ---

  // フォーム管理 (バリデーション・送信状態)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormInputs>();

  // 認証・ルーティング用フック
  const { login } = useAuth();
  const navigate = useNavigate();

  // エラー状態管理
  const [error, setError] = useState('');

  // --- Event Handlers ---

  // ログインフォーム送信処理
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setError('');

    try {
      // APIへログインリクエスト
      const res = await api.post<AuthResponse>('/auth/login', data);

      // トークンを保存して認証状態を更新
      await login(res.data.access_token);

      // ログイン成功後、トップページへ遷移
      navigate('/');
    } catch {
      
      // 通信失敗または認証エラー時の処理
      setError('メールアドレスまたはパスワードが違います');
    }
  };

  // --- Render ---
  return (
    <AuthLayout
      subtitle="思い出を地図に残そう"
      footerText="アカウントをお持ちでないですか？"
      footerLinkText="新規登録はこちら"
      footerLinkTo="/register"
    >
      {/* エラーメッセージ表示 */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>

        {/* メールアドレス入力 */}
        <div className={styles.formGroup}>
          <input 
            type="email" 
            {...register('email', { required: true })} 
            className={styles.input}
            placeholder="メールアドレス"
            disabled={isSubmitting}
          />
        </div>

        {/* パスワード入力 */}
        <div className={styles.formGroup}>
          <input 
            type="password" 
            {...register('password', { required: true })} 
            className={styles.input}
            placeholder="パスワード"
            disabled={isSubmitting}
          />
        </div>

        {/* ログイン実効ボタン */}
        <button 
          type="submit"
          className={styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </AuthLayout>
  );
};