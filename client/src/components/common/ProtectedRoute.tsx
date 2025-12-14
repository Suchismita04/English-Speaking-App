import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

// ProtectedRoute component to guard routes that require authentication
interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // Redirect to home page if not authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;