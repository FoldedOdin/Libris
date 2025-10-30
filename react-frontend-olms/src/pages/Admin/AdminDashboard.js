import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI } from '../../api/transactions';
import { booksAPI } from '../../api/books';
import { usersAPI } from '../../api/users';
import { donationsAPI } from '../../api/donations';
import { salesAPI } from '../../api/sales';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalBooks: 0,
      totalUsers: 0,
      borrowedBooks: 0,
      overdueBooks: 0,
      pendingDonations: 0,
      pendingSales: 0,
      totalDonations: 0,
      totalSales: 0
    },
    recentTransactions: [],
    recentDonations: [],
    recentSales: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [
        booksResponse,
        usersResponse,
        borrowedBooksResponse,
        overdueBooksResponse,
        pendingDonationsResponse,
        pendingSalesResponse,
        recentTransactionsResponse,
        recentDonationsResponse,
        recentSalesResponse
      ] = await Promise.all([
        booksAPI.getAll({ page_size: 1 }),
        usersAPI.getAll({ page_size: 1 }),
        transactionsAPI.getAllBorrowedBooks({ page_size: 1 }),
        transactionsAPI.getOverdueBooks({ page_size: 1 }),
        donationsAPI.getPendingDonations({ page_size: 1 }),
        salesAPI.getPendingSales({ page_size: 1 }),
        transactionsAPI.getAllBorrowingHistory({ page_size: 5, ordering: '-date' }),
        donationsAPI.getAll({ page_size: 5, ordering: '-created_at' }),
        salesAPI.getAll({ page_size: 5, ordering: '-created_at' })
      ]);

      // Extract counts and data
      const stats = {
        totalBooks: booksResponse.success ? (booksResponse.data.count || 0) : 0,
        totalUsers: usersResponse.success ? (usersResponse.data.count || 0) : 0,
        borrowedBooks: borrowedBooksResponse.success ? (borrowedBooksResponse.data.count || 0) : 0,
        overdueBooks: overdueBooksResponse.success ? (overdueBooksResponse.data.count || 0) : 0,
        pendingDonations: pendingDonationsResponse.success ? (pendingDonationsResponse.data.count || 0) : 0,
        pendingSales: pendingSalesResponse.success ? (pendingSalesResponse.data.count || 0) : 0,
        totalDonations: recentDonationsResponse.success ? (recentDonationsResponse.data.count || 0) : 0,
        totalSales: recentSalesResponse.success ? (recentSalesResponse.data.count || 0) : 0
      };

      const recentTransactions = recentTransactionsResponse.success ? 
        (recentTransactionsResponse.data.results || []) : [];
      const recentDonations = recentDonationsResponse.success ? 
        (recentDonationsResponse.data.results || []) : [];
      const recentSales = recentSalesResponse.success ? 
        (recentSalesResponse.data.results || []) : [];

      setDashboardData({
        stats,
        recentTransactions,
        recentDonations,
        recentSales
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'manage-books':
        navigate('/admin/books');
        break;
      case 'manage-users':
        navigate('/admin/users');
        break;
      case 'manage-donations':
        navigate('/admin/donations');
        break;
      case 'manage-sales':
        navigate('/admin/sales');
        break;
      case 'view-borrowed':
        navigate('/admin/borrowed-books');
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-badge status-pending';
      case 'approved':
        return 'status-badge status-approved';
      case 'rejected':
        return 'status-badge status-rejected';
      case 'borrowed':
        return 'status-badge status-borrowed';
      case 'returned':
        return 'status-badge status-returned';
      case 'overdue':
        return 'status-badge status-overdue';
      default:
        return 'status-badge status-default';
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
        </div>
        <ErrorMessage message={error} onRetry={fetchDashboardData} />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.username || 'Admin'}</p>
        </div>
        <button 
          className="btn btn-danger"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Key Statistics */}
      <div className="dashboard-stats">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.totalBooks}</h3>
              <p>Total Books</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.borrowedBooks}</h3>
              <p>Currently Borrowed</p>
            </div>
          </div>
          
          <div className="stat-card overdue">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.overdueBooks}</h3>
              <p>Overdue Books</p>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">🎁</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.pendingDonations}</h3>
              <p>Pending Donations</p>
            </div>
          </div>
          
          <div className="stat-card pending">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.pendingSales}</h3>
              <p>Pending Sales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button 
            className="action-btn primary"
            onClick={() => handleQuickAction('manage-books')}
          >
            <span className="action-icon">📚</span>
            Manage Books
          </button>
          
          <button 
            className="action-btn secondary"
            onClick={() => handleQuickAction('manage-users')}
          >
            <span className="action-icon">👥</span>
            Manage Users
          </button>
          
          <button 
            className="action-btn warning"
            onClick={() => handleQuickAction('view-borrowed')}
          >
            <span className="action-icon">📖</span>
            View Borrowed Books
          </button>
          
          <button 
            className="action-btn info"
            onClick={() => handleQuickAction('manage-donations')}
          >
            <span className="action-icon">🎁</span>
            Review Donations
          </button>
          
          <button 
            className="action-btn success"
            onClick={() => handleQuickAction('manage-sales')}
          >
            <span className="action-icon">💰</span>
            Review Sales
          </button>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="dashboard-activities">
        <div className="activities-grid">
          {/* Recent Transactions */}
          <div className="activity-section">
            <h3>Recent Transactions</h3>
            <div className="activity-list">
              {dashboardData.recentTransactions.length > 0 ? (
                dashboardData.recentTransactions.map((transaction, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <p className="activity-title">
                        {transaction.book_title || 'Unknown Book'}
                      </p>
                      <p className="activity-subtitle">
                        {transaction.user_name || 'Unknown User'} - {transaction.transaction_type}
                      </p>
                      <p className="activity-date">{formatDate(transaction.date)}</p>
                    </div>
                    <div className={getStatusBadgeClass(transaction.transaction_type)}>
                      {transaction.transaction_type}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent transactions</p>
              )}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="activity-section">
            <h3>Recent Donations</h3>
            <div className="activity-list">
              {dashboardData.recentDonations.length > 0 ? (
                dashboardData.recentDonations.map((donation, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <p className="activity-title">{donation.book_title}</p>
                      <p className="activity-subtitle">
                        by {donation.author} - {donation.user_name || 'Unknown User'}
                      </p>
                      <p className="activity-date">{formatDate(donation.created_at)}</p>
                    </div>
                    <div className={getStatusBadgeClass(donation.status)}>
                      {donation.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent donations</p>
              )}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="activity-section">
            <h3>Recent Sales</h3>
            <div className="activity-list">
              {dashboardData.recentSales.length > 0 ? (
                dashboardData.recentSales.map((sale, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-info">
                      <p className="activity-title">
                        {sale.book_title || 'Unknown Book'}
                      </p>
                      <p className="activity-subtitle">
                        ₹{sale.price} - {sale.user_name || 'Unknown User'}
                      </p>
                      <p className="activity-date">{formatDate(sale.created_at)}</p>
                    </div>
                    <div className={getStatusBadgeClass(sale.status)}>
                      {sale.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data">No recent sales</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;