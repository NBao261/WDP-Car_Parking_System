import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';
import { UserRole } from '../../../shared/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export const AuthRedirect = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    let dashboardPath = '/staff/shift-selection';
    if (user.role === UserRole.ADMIN) dashboardPath = '/admin';
    else if (user.role === UserRole.MANAGER) dashboardPath = '/manager';
    else if (user.role === UserRole.DRIVER) dashboardPath = '/driver';

    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};
