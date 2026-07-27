import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CloseOutlined, DatabaseOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { loginThunk, clearError } from './authSlice';
import { C, Btn } from '../../shared/ui/primitives';
import { motion } from '../../shared/ui/animated/animations';

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
}

const AuthField: React.FC<AuthFieldProps> = ({ label, icon, ...props }) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 12, fontWeight: 700, color: C.heading }}>{label}</span>
    <span style={{ position: 'relative', display: 'block' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 15 }}>
        {icon}
      </span>
      <input
        className="ui-field"
        style={{
          width: '100%',
          minHeight: 38,
          padding: '9px 12px 9px 38px',
          border: `1px solid ${C.inputBorder}`,
          borderRadius: C.radiusSm,
          fontSize: 13,
          color: C.heading,
          background: '#FFFFFF',
          outline: 'none',
          transition: 'border-color 0.16s ease, box-shadow 0.16s ease',
        }}
        {...props}
      />
    </span>
  </label>
);

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
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: C.bg,
        padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
        style={{
          width: 'min(100%, 420px)',
          background: C.surface,
          borderRadius: C.radiusLg,
          border: `1px solid ${C.border}`,
          boxShadow: C.shadow,
          padding: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div
            style={{
              width: 42,
              height: 42,
              background: C.graphite,
              borderRadius: C.radiusLg,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DatabaseOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: C.heading, lineHeight: 1.15 }}>ИС «АСУ»</div>
            <div style={{ fontSize: 13, color: C.secondary, marginTop: 3 }}>{t('auth.loginSubtitle')}</div>
          </div>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 600, color: C.heading, lineHeight: 1.15, marginBottom: 6 }}>
          {t('auth.loginTitle')}
        </h1>

        {error && (
          <div
            className="ui-badge"
            style={{
              background: C.dangerBg,
              color: C.danger,
              padding: '10px 12px',
              borderRadius: C.radiusMd,
              fontSize: 13,
              marginTop: 18,
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              border: '1px solid rgba(180, 35, 24, 0.12)',
            }}
          >
            <span>{error}</span>
            <button
              className="ui-icon-button"
              onClick={() => dispatch(clearError())}
              aria-label="Close"
              style={{
                width: 28,
                height: 28,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                color: C.danger,
                cursor: 'pointer',
              }}
            >
              <CloseOutlined />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ marginTop: error ? 0 : 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <AuthField
              label={t('auth.username')}
              icon={<UserOutlined />}
              placeholder={t('auth.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <AuthField
              label={t('auth.password')}
              icon={<LockOutlined />}
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
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('auth.login')}
          </Btn>
        </form>

        <div style={{ textAlign: 'center', marginTop: 22, fontSize: 12, color: C.muted }}>
          АО «КФГД» © {new Date().getFullYear()}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
