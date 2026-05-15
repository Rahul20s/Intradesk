import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { accounts } = useMsal();
  
  // Check if user is admin
  const isAdmin = accounts.length > 0 && accounts[0].username.toLowerCase() === 'rahul.sharma@cfmarc.in';
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default AdminProtectedRoute;
