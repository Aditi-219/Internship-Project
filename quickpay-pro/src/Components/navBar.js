import { FiLogOut } from 'react-icons/fi';
// Remove FiUser import since it's not used

function Navbar({ admin = { fullName: 'Admin' }, onLogout }) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <nav className="navbar navbar-dark shadow-lg" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center">
          <div className="me-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-circle" style={{ width: '45px', height: '45px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 13c-2.33 0-4.31-1.46-5.11-3.5 1.51-.95 3.21-1.5 5.11-1.5s3.6.55 5.11 1.5c-.8 2.04-2.78 3.5-5.11 3.5z"/>
              </svg>
            </div>
          </div>
          <div>
            <span className="navbar-brand mb-0 h1 fw-bold">QuickPay Pro+</span>
            <small className="d-block text-white-50" style={{ fontSize: '0.75rem' }}>
              Leave & Payroll Management System
            </small>
          </div>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <div className="text-white text-end">
            <div className="small text-white-50">Welcome, {admin?.fullName || 'Admin'}</div>
            <div className="fw-bold">{currentDate}</div>
          </div>
          <button 
            onClick={onLogout}
            className="btn btn-light btn-sm rounded-pill px-3"
            style={{ transition: 'all 0.3s ease' }}
          >
            <FiLogOut className="me-1" /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;