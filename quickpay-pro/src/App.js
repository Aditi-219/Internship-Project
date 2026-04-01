import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const adminData = localStorage.getItem('admin');
    
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(adminData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (adminData) => {
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard admin={admin} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;