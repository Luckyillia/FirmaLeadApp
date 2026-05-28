import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface RequireRoleProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
