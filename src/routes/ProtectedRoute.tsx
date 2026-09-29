import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue" />
      </div>
    );
  }

  if (!user) {
    const redirectPath = allowedRole === 'admin' ? '/admin/login' : '/login';
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redireciona o usuário para sua própria área se tentar acessar a outra
    return <Navigate to={user.role === 'admin' ? '/admin' : '/cliente'} replace />;
  }

  return children;
};
