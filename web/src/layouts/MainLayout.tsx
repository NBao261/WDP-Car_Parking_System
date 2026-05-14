import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store';

const MainLayout: React.FC = () => {
  const { logout, user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-xl font-bold">SPMS</Link>
          <nav className="hidden md:flex space-x-4">
            <Link to="/admin" className="hover:text-blue-200">Admin</Link>
            <Link to="/manager" className="hover:text-blue-200">Manager</Link>
            <Link to="/staff" className="hover:text-blue-200">Staff</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <span>{user?.name} ({user?.role})</span>
          <button 
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
      <footer className="bg-white border-t p-4 text-center text-gray-500">
        &copy; 2026 Smart Parking Management System
      </footer>
    </div>
  );
};

export default MainLayout;
