import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bus, User, LogOut, Ticket, LayoutDashboard, Search, Key } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top bg-dark navbar-dark py-3 shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 font-weight-bold fs-4" to="/">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
            <Bus size={24} />
          </div>
          <span className="fw-bold tracking-tight">Bus<span className="text-primary">Go</span></span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link active fw-medium" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-medium" to="/search?from=Ahmedabad&to=Mumbai">Search Buses</Link>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link fw-medium" to="/my-bookings">
                  <Ticket size={18} className="me-1" /> My Bookings
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <User size={18} />
                  <span>{user?.name || 'Account'}</span>
                  {isAdmin && <span className="badge bg-danger ms-1">ADMIN</span>}
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 rounded-3" aria-labelledby="userDropdown">
                  <li className="px-3 py-2 border-bottom">
                    <div className="fw-bold text-dark">{user?.name}</div>
                    <small className="text-muted">{user?.email}</small>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      <User size={16} className="me-2" /> View Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/my-bookings">
                      <Ticket size={16} className="me-2" /> My Bookings
                    </Link>
                  </li>
                  {isAdmin && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link className="dropdown-item py-2 text-danger fw-bold" to="/admin/dashboard">
                          <LayoutDashboard size={16} className="me-2" /> Admin Dashboard
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <LogOut size={16} className="me-2" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light rounded-pill px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary rounded-pill px-4 shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
