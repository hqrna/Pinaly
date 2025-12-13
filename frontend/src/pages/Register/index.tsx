import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { useState } from 'react';
import type { ApiError, RegisterFormInputs } from '../../types';
import styles from './Register.module.css'

// ------------------------------------------------------------------
// RegisterPage：新規ユーザー登録画面
// ------------------------------------------------------------------

export const RegisterPage = () => {
  
  // --- Hooks & Status ---
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<RegisterFormInputs>();
  
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>('');

  // --- Handlers ---
  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      setServerError('');
      await api.post('/auth/register', data);
      alert('登録成功！ログインしてください。');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as ApiError;
      setServerError(error.response?.data?.detail || '登録エラー');
    }
  };

  // --- Render ---
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>ユーザー登録</h2>
      {/* サーバー側エラーの表示 */}
      {serverError && <p className={styles.errorMessage}>{serverError}</p>}
    
      <form onSubmit={handleSubmit(onSubmit)}>

        {/* ユーザー名 */}
        <div className={styles.formGroup}>
          <label className={styles.label}>ユーザー名</label>
          <input 
            {...register('name', { required: true })} 
            className={styles.input}
          />
        </div>

        {/* メールアドレス */}
        <div className={styles.formGroup}>
          <label className={styles.label}>メールアドレス</label>
          <input 
            type="email" 
            {...register('email', { 
              required: 'メールアドレスは必須です',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '正しいメールアドレス形式で入力してください'
              }
            })} 
            className={styles.input}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email.message}</span>
          )}
        </div>

        {/* パスワード */}
        <div className={styles.formGroup}>
          <label className={styles.label}>パスワード</label>
          <input 
            type="password" 
            {...register('password', { required: true, minLength: 6 })} 
            className={styles.input}
          />
          {errors.password && (
            <span className={styles.errorMessage}>6文字以上で入力してください</span>
          )}
        </div>

        <button type="submit" className={styles.button}>
          登録
        </button>
      </form>
      
      <div className={styles.linkContainer}>
        <Link to="/login">ログインはこちら</Link>
      </div>
    </div>
  );
};