import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';
import type { LoginFormInputs, AuthResponse } from '../types';

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
    <div className="container" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>ログイン</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>メールアドレス</label>
          <input 
            type="email" 
            {...register('email', { required: true })} 
            style={{ width: '100%' }} 
          />
        </div>
        <div>
          <label>パスワード</label>
          <input 
            type="password" 
            {...register('password', { required: true })} 
            style={{ width: '100%' }} 
          />
        </div>
        <button type="submit" style={{ marginTop: '20px', width: '100%' }}>
          ログイン
        </button>
      </form>
      
      <div style={{ marginTop: '10px' }}>
        <Link to="/register">新規登録はこちら</Link>
      </div>
    </div>
  );
};