import { createBrowserRouter, Navigate } from 'react-router-dom';
import { UserRole } from '../../../shared/types';
import { ProtectedRoute, AuthRedirect } from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import StaffDashboard from '../pages/staff/StaffDashboard';
import UnauthorizedPage from '../pages/error/UnauthorizedPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <AuthRedirect>
        <LoginPage />
      </AuthRedirect>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          // Admin Routes
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />,
            children: [
              {
                index: true,
                element: <AdminDashboard />,
              },
            ],
          },
          // Manager Routes
          {
            path: 'manager',
            element: <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]} />,
            children: [
              {
                index: true,
                element: <ManagerDashboard />,
              },
            ],
          },
          // Staff Routes
          {
            path: 'staff',
            element: (
              <ProtectedRoute allowedRoles={[UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN]} />
            ),
            children: [
              {
                index: true,
                element: <StaffDashboard />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
