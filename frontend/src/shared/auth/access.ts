import type { User } from '../types';

export const MANAGER_ACCESS_CODE = 'system.manager';

export function isManagerUser(user: User | null | undefined) {
  const permissions = user?.effective_permissions || [];
  return Boolean(
    user
    && (
      user.is_superuser
      || user.role === 'ADMIN'
      || permissions.includes(MANAGER_ACCESS_CODE)
      || permissions.includes('system.admin')
    ),
  );
}

export function isDepartmentApprover(user: User | null | undefined) {
  const permissions = user?.effective_permissions || [];
  return Boolean(user && (user.role === 'DEPT_HEAD' || permissions.includes('requests.approve_department')));
}
