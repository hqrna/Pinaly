import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginFormInputs, AuthResponse } from '../../types';
import styles from './Login.module.css'

// ------------------------------------------------------------------
// LoginPage：ユーザー認証を行うためのログインフォーム画面
// ------------------------------------------------------------------

export const LoginPage = () => {

  // --- Hooks & States ---
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // --- Event Handlers ---
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      await login(res.data.access_token);
      navigate('/');
    } catch {
      setError('メールアドレスまたはパスワードが違います');
    }
  };

  // --- Render ---
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ログイン</h2>

      {/* エラーメッセージ */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <label className={styles.label}>メールアドレス</label>
          <input 
            type="email" 
            {...register('email', { required: true })} 
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>パスワード</label>
          <input 
            type="password" 
            {...register('password', { required: true })} 
            className={styles.input}
          />
        </div>
        <button type="submit" className={styles.button}>
          ログイン
        </button>
      </form>
      
      <div className={styles.linkContainer}>
        <Link to="/register">新規登録はこちら</Link>
      </div>
    </div>
  );
};