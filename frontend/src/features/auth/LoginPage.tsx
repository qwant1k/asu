import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { loginThunk, clearError } from './authSlice';
import { C, Btn, InputField } from '../../shared/ui/primitives';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      dispatch(loginThunk({ username, password }));
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: C.bg,
    }}>
      <div style={{
        width: 400, background: '#fff', borderRadius: 12,
        border: `1px solid ${C.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)', padding: 40,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, background: C.accent, borderRadius: 10,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>АУ</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.heading, marginBottom: 4 }}>
            {t('auth.loginTitle')}
          </h2>
          <p style={{ fontSize: 13, color: C.secondary }}>{t('auth.loginSubtitle')}</p>
        </div>

        {error && (
          <div style={{
            background: C.dangerBg, color: C.danger, padding: '10px 14px',
            borderRadius: 6, fontSize: 13, marginBottom: 16,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              style={{ background: 'none', border: 'none', color: C.danger, cursor: 'pointer', fontSize: 14 }}
            >✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            <InputField
              label={t('auth.username')}
              placeholder={t('auth.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <InputField
              label={t('auth.password')}
              placeholder={t('auth.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Btn
            type="submit"
            loading={isLoading}
            disabled={!username || !password}
            style={{ width: '100%' }}
          >
            {t('auth.login')}
          </Btn>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: C.muted }}>
          АО «КФГД» © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
