import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-trash-fill me-2"></i>
          <span>Smart Waste Management</span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2" to="/login">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2" to="/register">
                    <i className="bi bi-person-plus me-2"></i>
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item mx-2">
                  <span className="nav-link px-3 py-2 d-flex align-items-center">
                    <i className="bi bi-person-circle me-2"></i>
                    <span>
                      {user.name} <small>({user.role})</small>
                    </span>
                  </span>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link btn btn-link px-3 py-2 d-flex align-items-center" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;