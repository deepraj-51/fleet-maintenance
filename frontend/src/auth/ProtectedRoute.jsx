import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Wrap any route element: <ProtectedRoute><Dashboard /></ProtectedRoute>
// Pass allowedRoles to additionally restrict by role, e.g. ['FLEET_MANAGER']
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
