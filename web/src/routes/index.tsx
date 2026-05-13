import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>Welcome to Smart Parking Web Portal</div>,
  },
  {
    path: '/admin',
    element: <div>Admin Dashboard</div>,
  },
  {
    path: '/staff',
    element: <div>Staff Portal</div>,
  },
  {
    path: '/login',
    element: <div>Login Page</div>,
  }
]);
