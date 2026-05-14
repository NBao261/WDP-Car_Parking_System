import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { UserRole } from '../../../../shared/types';
import { Button } from '../../components/ui/button';

const LoginPage: React.FC = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleMockLogin = () => {
    // Mock setting the user state so ProtectedRoute lets us pass
    setAuth(
      {
        id: '1',
        name: 'Super Admin',
        email: 'admin@parkmaster.com',
        role: UserRole.ADMIN,
      },
      'mock-jwt-token'
    );
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
        <h2 className="mb-2 text-2xl font-bold text-center text-brand">SPMS Login</h2>
        <p className="text-gray-500 text-center mb-8">Please enter your credentials</p>
        
        {/* Quick Mock Login for testing Layout */}
        <Button 
          className="w-full" 
          size="lg" 
          onClick={handleMockLogin}
        >
          Mock Login as Admin
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;
