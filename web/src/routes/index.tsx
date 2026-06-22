import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { UserRole } from '../../../shared/types';
import { ProtectedRoute, AuthRedirect } from '../components/ProtectedRoute';
import MainLayout from '../layouts/MainLayout';
import StaffLayout from '../layouts/StaffLayout';

// ── Auth Pages ──
import LoginPage from '../pages/auth/LoginPage';
import UnauthorizedPage from '../pages/error/UnauthorizedPage';

// ── Admin Pages ──
import DashboardPage from '../pages/admin/dashboard/DashboardPage';


const BillingPage = lazy(() => import('../pages/admin/billing/BillingPage'));
const ConfigPage = lazy(() => import('../pages/admin/config/ConfigPage'));
const UsersPage = lazy(() => import('../pages/admin/users/UsersPage'));
const UserDetailPage = lazy(() => import('../pages/admin/users/UserDetailPage'));
const RolesPage = lazy(() => import('../pages/admin/roles/RolesPage'));

// ── Manager / Staff Pages ──
import ManagerDashboard from '../pages/manager/ManagerDashboard';
const AssignmentsPage = lazy(() => import('../pages/manager/components/assignments/AssignmentsPage'));
const VehiclesPage = lazy(() => import('../pages/shared/vehicles/VehiclesPage'));
const SharedFacilitiesPage = lazy(() => import('../pages/shared/facilities/FacilitiesPage'));
const SharedPricingPage = lazy(() => import('../pages/shared/pricing/PricingPage'));
const SharedReportsPage = lazy(() => import('../pages/shared/reports/ReportsPage'));
// Staff Pages ──
const VehicleCheckPage = lazy(() => import('../pages/staff/vehicleCheck/VehicleCheckPage'));
const ActiveSessionsPage = lazy(() => import('../pages/staff/activeSessions/ActiveSessionsPage'));
const ExceptionsStaffPage = lazy(() => import('../pages/staff/exceptionsStaff/ExceptionsStaffPage'));
const ShiftSelectionPage = lazy(() => import('../pages/staff/shiftSelection/ShiftSelectionPage'));

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-2 border-[#d7ee46] border-t-transparent rounded-full animate-spin" />
  </div>
);

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>{children}</Suspense>
);

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
        path: 'staff/shift-selection',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN]} />
        ),
        children: [{ index: true, element: <S><ShiftSelectionPage /></S> }],
      },
      {
        element: <MainLayout />,
        children: [
          // ── Admin Routes ──────────────────────────────────
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={[UserRole.ADMIN]} />,
            children: [
              { index: true, element: <DashboardPage /> },
              { path: 'facilities', element: <S><SharedFacilitiesPage /></S> },
              // FR-5: Quản lý Bảng giá
              { path: 'pricing', element: <S><SharedPricingPage /></S> },
              { path: 'billing', element: <S><BillingPage /></S> },
              { path: 'config', element: <S><ConfigPage /></S> },
              // { path: 'logs', element: <S><LogsPage /></S> },
              // FR-18: User Management
              { path: 'users', element: <S><UsersPage /></S> },
              { path: 'users/:id', element: <S><UserDetailPage /></S> },
              // FR-19: Role & Permission Management
              { path: 'roles', element: <S><RolesPage /></S> },
              { path: 'vehicles', element: <S><VehiclesPage /></S> },
            ],
          },

          // ── Manager Routes ────────────────────────────────
          {
            path: 'manager',
            element: <ProtectedRoute allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]} />,
            children: [
              { index: true, element: <ManagerDashboard /> },
              { path: 'assignments', element: <S><AssignmentsPage /></S> },
              { path: 'vehicles', element: <S><VehiclesPage /></S> },
              // FR-1,2,3: Quản lý Tòa nhà & Phân tầng
              { path: 'facilities', element: <S><SharedFacilitiesPage /></S> },
              // FR-5: Quản lý Bảng giá
              { path: 'pricing', element: <S><SharedPricingPage /></S> },
              // FR-6: Báo cáo
              { path: 'reports', element: <S><SharedReportsPage /></S> },
            ],
          },
        ],
      },
      {
        path: 'staff',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN]} />
        ),
        children: [
          {
            element: <StaffLayout />,
            children: [
              { index: true, element: <S><VehicleCheckPage /></S> },
              { path: 'active-sessions', element: <S><ActiveSessionsPage /></S> },
              { path: 'exceptions', element: <S><ExceptionsStaffPage /></S> },
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