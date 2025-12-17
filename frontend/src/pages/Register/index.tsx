import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { AuthLayout } from '../../components/Auth/AuthLayout';
import type { ApiError, RegisterFormInputs } from '../../types';
import styles from '../../styles/AuthForm.module.css';

// ------------------------------------------------------------------
// RegisterPage：新規ユーザーの登録を行うページ
// ------------------------------------------------------------------

export const RegisterPage = () => {

  // --- Hooks & States ---

  // フォーム管理 (バリデーション・エラーメッセージ)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormInputs>();
  
  // ルーティング用フック
  const navigate = useNavigate();

  // サーバー側のバリデーションエラー用
  const [serverError, setServerError] = useState<string>('');

  // --- Event Handlers ---

  // 新規登録フォーム送信処理
  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      setServerError('');
      // APIへユーザー登録リクエスト
      await api.post('/auth/register', data);
      alert('登録成功！ログインしてください。');

      // 成功後、ログインページへ遷移
      navigate('/login');
    } catch (err: unknown) {

      // APIエラーのハンドリング
      const error = err as ApiError;
      setServerError(error.response?.data?.detail || '登録エラーが発生しました');
    }
  };

  // --- Render ---
  return (
    <AuthLayout
      subtitle="アカウントを作成"
      footerText="すでにアカウントをお持ちですか？"
      footerLinkText="ログインはこちら"
      footerLinkTo="/login"
    >

        {/* サーバーエラーの表示エリア */}      
      {serverError && <div className={styles.errorMessage}>{serverError}</div>}
  
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* ユーザー名入力 */}
        <div className={styles.formGroup}>
          <input 
            type="text"
            {...register('name', { required: 'ユーザー名は必須です' })} 
            className={styles.input}
            placeholder="ユーザー名"
            disabled={isSubmitting}
          />
          {errors.name && (
             <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '4px' }}>
               {errors.name.message}
             </span>
          )}
        </div>

        {/* メールアドレス入力 */}
        <div className={styles.formGroup}>
          <input 
            type="email"
            {...register('email', { 
              required: 'メールアドレスは必須です',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '正しいメールアドレスを入力してください'
              }
            })} 
            className={styles.input}
            placeholder="メールアドレス"
            disabled={isSubmitting}
          />
          {errors.email && (
             <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '4px' }}>
               {errors.email.message}
             </span>
          )}
        </div>

        {/* パスワード入力 */}
        <div className={styles.formGroup}>
          <input 
            type="password"
            {...register('password', { 
              required: 'パスワードは必須です',
              minLength: {
                value: 6,
                message: 'パスワードは6文字以上で入力してください'
              }
            })} 
            className={styles.input}
            placeholder="パスワード"
            disabled={isSubmitting}
          />
          {errors.password && (
             <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '4px' }}>
               {errors.password.message}
             </span>
          )}
        </div>
        
        {/* 登録ボタン */}
        <button
          type="submit"
          className={styles.button}
          disabled={isSubmitting}
        >
           {isSubmitting ? '登録中...' : '新規登録'}
        </button>
        
      </form>
    </AuthLayout>
  );
};