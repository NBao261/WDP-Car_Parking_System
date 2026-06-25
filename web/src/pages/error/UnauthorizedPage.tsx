import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403 - Unauthorized</h1>
      <p className="text-lg text-gray-700 mb-6">You do not have permission to access this page.</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Go back to Home
      </Link>
    </div>
  );
};

export default UnauthorizedPage;
