import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../core/store/store';
import { UserRole } from '../core/constants/types';

interface Props {
  children: ReactNode;
  roles?: UserRole[];
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuth, user } = useAppSelector((s) => s.auth);

  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/tenders" replace />;
  }

  return <>{children}</>;
}
