import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const admin = localStorage.getItem('admin');
  
  if (!token || !admin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;