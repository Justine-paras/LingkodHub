import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'client' | 'provider';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState<'client' | 'provider' | null>(null);
  const location = useLocation();

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.getMe();
        setIsAuthenticated(true);
        setUserRole(user.role);
      } catch (error) {
        setIsAuthenticated(false);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    // Redirect to their correct dashboard
    return <Navigate to={userRole === 'provider' ? '/provider/dashboard' : '/client/dashboard'} replace />;
  }

  return <>{children}</>;
};
