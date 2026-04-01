import { useState } from 'react';
import { FiUser, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use environment variable for API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token and admin info
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify({
        id: data._id,
        username: data.username,
        fullName: data.fullName
      }));
      
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-3">
                    <FiLogIn size={40} className="text-primary" />
                  </div>
                  <h2 className="fw-bold">Welcome Back</h2>
                  <p className="text-muted">Login to QuickPay Pro+ Admin Panel</p>
                </div>
                
                {error && (
                  <div className="alert alert-danger d-flex align-items-center mb-3">
                    <FiAlertCircle className="me-2" />
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Username</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FiUser />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="form-label fw-bold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FiLock />
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0 ps-0"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-bold"
                    disabled={loading}
                    style={{ borderRadius: '10px' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <FiLogIn className="me-2" />
                        Login
                      </>
                    )}
                  </button>
                </form>
                
                <div className="text-center mt-4">
                  <small className="text-muted">
                    Default credentials:<br />
                    Username: <strong>admin</strong><br />
                    Password: <strong>admin123</strong>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;