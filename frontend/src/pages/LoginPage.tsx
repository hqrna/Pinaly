import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { LoginFormInputs, AuthResponse } from '../types';

export const LoginPage = () => {
  const { register, handleSubmit } = useForm<LoginFormInputs>();
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      
      await login(res.data.access_token);
      navigate('/');
    } catch {
      setError('メールアドレスまたはパスワードが違います');
    }
  };

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