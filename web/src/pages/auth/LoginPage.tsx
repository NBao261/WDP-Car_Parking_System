import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">SPMS Login</h2>
        <p className="text-gray-600 text-center">Please enter your credentials</p>
        {/* Login form will go here */}
      </div>
    </div>
  );
};

export default LoginPage;
