import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo */}
        <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
          OLMS
        </Link>

        {/* Mobile menu toggle */}
        <button 
          className="navbar-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
          <span className="navbar-toggle-icon"></span>
        </button>

        {/* Navigation menu */}
        <div className={`navbar-menu ${isMobileMenuOpen ? 'navbar-menu-open' : ''}`}>
          {isAuthenticated ? (
            <>
              {/* User navigation items */}
              <div className="navbar-nav">
                {isAdmin() ? (
                  // Admin navigation
                  <>
                    <Link to="/admin/dashboard" className="navbar-link" onClick={closeMobileMenu}>
                      Dashboard
                    </Link>
                    <Link to="/admin/books" className="navbar-link" onClick={closeMobileMenu}>
                      Manage Books
                    </Link>
                    <Link to="/admin/users" className="navbar-link" onClick={closeMobileMenu}>
                      Manage Users
                    </Link>
                    <Link to="/admin/donations" className="navbar-link" onClick={closeMobileMenu}>
                      Donations
                    </Link>
                    <Link to="/admin/sales" className="navbar-link" onClick={closeMobileMenu}>
                      Sales
                    </Link>
                  </>
                ) : (
                  // Regular user navigation
                  <>
                    <Link to="/dashboard" className="navbar-link" onClick={closeMobileMenu}>
                      Dashboard
                    </Link>
                    <Link to="/books" className="navbar-link" onClick={closeMobileMenu}>
                      Browse Books
                    </Link>
                    <Link to="/my-books" className="navbar-link" onClick={closeMobileMenu}>
                      My Books
                    </Link>
                    <Link to="/donate" className="navbar-link" onClick={closeMobileMenu}>
                      Donate
                    </Link>
                    <Link to="/sell" className="navbar-link" onClick={closeMobileMenu}>
                      Sell
                    </Link>
                  </>
                )}
              </div>

              {/* User info and logout */}
              <div className="navbar-user">
                <span className="navbar-user-info">
                  Welcome, {user?.first_name || user?.username}
                  {isAdmin() && <span className="user-role-badge">Admin</span>}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="navbar-logout-btn"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            // Guest navigation
            <div className="navbar-nav">
              <Link to="/#features" className="navbar-link" onClick={closeMobileMenu}>Features</Link>
              <Link to="/#pricing" className="navbar-link" onClick={closeMobileMenu}>Pricing</Link>
              <Link to="/#about" className="navbar-link" onClick={closeMobileMenu}>About</Link>
              <Link to="/login" className="navbar-link" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="navbar-link" onClick={closeMobileMenu}>Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;