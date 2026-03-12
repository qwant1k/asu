/* Хук проверки роли пользователя для защиты роутов */

import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { UserRole } from '../types';

export const useRequireRole = (allowedRoles: UserRole[]) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isAuthenticated, allowedRoles, navigate]);

  return { user, isAuthenticated, hasAccess: user ? allowedRoles.includes(user.role) : false };
};
