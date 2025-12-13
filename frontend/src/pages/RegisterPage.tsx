import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useState } from 'react';
import type { ApiError, RegisterFormInputs } from '../types';

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
    <div className="container" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>ユーザー登録</h2>
      {/* サーバー側エラーの表示 */}
      {serverError && <p style={{ color: 'red' }}>{serverError}</p>}
    
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>ユーザー名</label>
          <input 
            {...register('name', { required: true })} 
            style={{ width: '100%' }} 
          />
        </div>
        <div>
          <label>メールアドレス</label>
          <input 
            type="email" 
            {...register('email', { 
              required: 'メールアドレスは必須です',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: '正しいメールアドレス形式で入力してください'
              }
            })} 
            style={{ width: '100%' }} 
          />
          {errors.email && (
            <span style={{ color: 'red' }}>{errors.email.message}</span>
          )}
        </div>
        <div>
          <label>パスワード</label>
          <input 
            type="password" 
            {...register('password', { required: true, minLength: 6 })} 
            style={{ width: '100%' }} 
          />
          {errors.password && (
            <span style={{ color: 'red' }}>6文字以上で入力してください</span>
          )}
        </div>
        <button type="submit" style={{ marginTop: '20px', width: '100%' }}>
          登録
        </button>
      </form>
      
      <div style={{ marginTop: '10px' }}>
        <Link to="/login">ログインはこちら</Link>
      </div>
    </div>
  );
};