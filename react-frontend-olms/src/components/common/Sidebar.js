import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    pendingDonations: 0,
    pendingSales: 0,
    borrowedBooks: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Only render sidebar for admin users
  if (!isAdmin()) {
    return null;
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard/stats/', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalBooks: data.total_books || 0,
            totalUsers: data.total_users || 0,
            pendingDonations: data.pending_donations || 0,
            pendingSales: data.pending_sales || 0,
            borrowedBooks: data.overdue_books || 0
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const isActiveLink = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navigationItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: '📊'
    },
    {
      path: '/admin/books',
      label: 'Manage Books',
      icon: '📚'
    },
    {
      path: '/admin/users',
      label: 'Manage Users',
      icon: '👥'
    },
    {
      path: '/admin/donations',
      label: 'Donations',
      icon: '🎁',
      badge: stats.pendingDonations > 0 ? stats.pendingDonations : null
    },
    {
      path: '/admin/sales',
      label: 'Sales',
      icon: '💰',
      badge: stats.pendingSales > 0 ? stats.pendingSales : null
    },
    {
      path: '/admin/borrowed',
      label: 'Borrowed Books',
      icon: '📖'
    }
  ];

  const quickActions = [
    {
      path: '/admin/books/add',
      label: 'Add New Book',
      icon: '➕'
    },
    {
      path: '/admin/users/add',
      label: 'Add New User',
      icon: '👤'
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">Admin Panel</h3>
          <button className="sidebar-close" onClick={onToggle} aria-label="Close sidebar">
            ✕
          </button>
        </div>

        {/* Dashboard Statistics */}
        <div className="sidebar-stats">
          <h4 className="sidebar-section-title">Quick Stats</h4>
          {isLoading ? (
            <div className="sidebar-stats-loading">Loading...</div>
          ) : (
            <div className="sidebar-stats-grid">
              <div className="sidebar-stat-item">
                <span className="sidebar-stat-value">{stats.totalBooks}</span>
                <span className="sidebar-stat-label">Total Books</span>
              </div>
              <div className="sidebar-stat-item">
                <span className="sidebar-stat-value">{stats.totalUsers}</span>
                <span className="sidebar-stat-label">Total Users</span>
              </div>
              <div className="sidebar-stat-item">
                <span className="sidebar-stat-value">{stats.borrowedBooks}</span>
                <span className="sidebar-stat-label">Borrowed</span>
              </div>
              <div className="sidebar-stat-item">
                <span className="sidebar-stat-value">{stats.pendingDonations + stats.pendingSales}</span>
                <span className="sidebar-stat-label">Pending</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <h4 className="sidebar-section-title">Navigation</h4>
          <ul className="sidebar-nav-list">
            {navigationItems.map((item) => (
              <li key={item.path} className="sidebar-nav-item">
                <Link
                  to={item.path}
                  className={`sidebar-nav-link ${isActiveLink(item.path) ? 'sidebar-nav-link-active' : ''}`}
                  onClick={onToggle}
                >
                  <span className="sidebar-nav-icon">{item.icon}</span>
                  <span className="sidebar-nav-text">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-nav-badge">{item.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Quick Actions */}
        <div className="sidebar-actions">
          <h4 className="sidebar-section-title">Quick Actions</h4>
          <div className="sidebar-actions-list">
            {quickActions.map((action) => (
              <Link
                key={action.path}
                to={action.path}
                className="sidebar-action-btn"
                onClick={onToggle}
              >
                <span className="sidebar-action-icon">{action.icon}</span>
                <span className="sidebar-action-text">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;