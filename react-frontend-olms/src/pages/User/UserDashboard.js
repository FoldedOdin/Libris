import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI } from '../../api/transactions';
import { donationsAPI } from '../../api/donations';
import { salesAPI } from '../../api/sales';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    borrowedBooks: [],
    recentDonations: [],
    recentSales: [],
    stats: {
      totalBorrowed: 0,
      overdueBooksCount: 0,
      totalDonations: 0,
      totalSales: 0,
      pendingDonations: 0,
      pendingSales: 0
    }
  });

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, location.pathname]); // Refetch when route changes

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError('');

      // Fetch borrowed books
      const borrowedResponse = await transactionsAPI.getBorrowedBooks();
      const borrowedBooks = borrowedResponse.data?.results || borrowedResponse.data || [];

      // Fetch user's donations
      const donationsResponse = await donationsAPI.getMyDonations({ page_size: 5 });
      const donations = donationsResponse.data?.results || donationsResponse.data || [];

      // Fetch user's sales
      const salesResponse = await salesAPI.getMySales({ page_size: 5 });
      const sales = salesResponse.data?.results || salesResponse.data || [];

      // Calculate statistics
      const overdueBooksCount = borrowedBooks.filter(book => {
        if (!book.due_date) return false;
        const dueDate = new Date(book.due_date);
        const today = new Date();
        return dueDate < today;
      }).length;

      const pendingDonations = donations.filter(donation => donation.status === 'pending').length;
      const pendingSales = sales.filter(sale => sale.status === 'pending').length;

      setDashboardData({
        borrowedBooks: borrowedBooks.slice(0, 5), // Show only first 5
        recentDonations: donations,
        recentSales: sales,
        stats: {
          totalBorrowed: borrowedBooks.length,
          overdueBooksCount,
          totalDonations: donations.length,
          totalSales: sales.length,
          pendingDonations,
          pendingSales
        }
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDue = (dueDateString) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'sold': return 'status-sold';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="main-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="user-dashboard">
          {/* Dashboard Header */}
          <div className="user-dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Welcome back, {user?.first_name || user?.username}!</h1>
              <p>Here's an overview of your library activity</p>
            </div>
            <button 
              className="btn btn-danger"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Dashboard Statistics */}
          <div className="dashboard-stats">
            <div className="user-stats-grid">
              <div className="user-stat-card">
                <span className="user-stat-number">{dashboardData.stats.totalBorrowed}</span>
                <span className="user-stat-label">Currently Borrowed</span>
              </div>
              
              <div className={`user-stat-card ${dashboardData.stats.overdueBooksCount > 0 ? 'overdue' : ''}`}>
                <span className="user-stat-number">{dashboardData.stats.overdueBooksCount}</span>
                <span className="user-stat-label">Overdue Books</span>
              </div>
              
              <div className="user-stat-card">
                <span className="user-stat-number">{dashboardData.stats.totalDonations}</span>
                <span className="user-stat-label">Total Donations</span>
              </div>
              
              <div className="user-stat-card">
                <span className="user-stat-number">{dashboardData.stats.totalSales}</span>
                <span className="user-stat-label">Total Sales</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="user-quick-actions">
            <h2>Quick Actions</h2>
            <div className="user-actions-grid">
              <Link to="/books" className="user-action-card">
                <div className="user-action-icon">🔍</div>
                <div className="user-action-title">Browse Books</div>
                <div className="user-action-description">Discover new books to borrow</div>
              </Link>
              <Link to="/my-books" className="user-action-card">
                <div className="user-action-icon">📖</div>
                <div className="user-action-title">My Borrowed Books</div>
                <div className="user-action-description">View your current loans</div>
              </Link>
              <Link to="/donate" className="user-action-card">
                <div className="user-action-icon">💝</div>
                <div className="user-action-title">Donate Books</div>
                <div className="user-action-description">Share books with the community</div>
              </Link>
              <Link to="/sell" className="user-action-card">
                <div className="user-action-icon">💰</div>
                <div className="user-action-title">Sell Books</div>
                <div className="user-action-description">List books for sale</div>
              </Link>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="dashboard-activities">
            <div className="activities-grid">
              {/* Currently Borrowed Books */}
              <div className="activity-section">
                <h3>Currently Borrowed Books</h3>
                <div className="activity-list">
                  {dashboardData.borrowedBooks.length > 0 ? (
                    dashboardData.borrowedBooks.map((book, index) => {
                      const daysUntilDue = getDaysUntilDue(book.due_date);
                      const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                      
                      return (
                        <div key={index} className="activity-item">
                          <div className="activity-info">
                            <h4 className="activity-title">
                              {book.book?.title || book.title || 'Unknown Title'}
                            </h4>
                            <p className="activity-subtitle">
                              by {book.book?.author || book.author || 'Unknown Author'}
                            </p>
                            <p className="activity-date">
                              Due: {formatDate(book.due_date)}
                              {daysUntilDue !== null && (
                                <span className={isOverdue ? 'overdue-date' : ''}>
                                  {isOverdue 
                                    ? ` (${Math.abs(daysUntilDue)} days overdue)`
                                    : ` (${daysUntilDue} days left)`
                                  }
                                </span>
                              )}
                            </p>
                          </div>
                          {isOverdue && (
                            <span className="status-badge status-overdue">Overdue</span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-data">
                      <p>No books currently borrowed</p>
                      <Link to="/books">Browse available books</Link>
                    </div>
                  )}
                </div>
                {dashboardData.borrowedBooks.length > 0 && (
                  <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', borderTop: '1px solid var(--light-color)' }}>
                    <Link to="/my-books" className="btn btn-primary btn-sm">
                      View All Borrowed Books
                    </Link>
                  </div>
                )}
              </div>

              {/* Recent Donations */}
              <div className="activity-section">
                <h3>Recent Donations</h3>
                <div className="activity-list">
                  {dashboardData.recentDonations.length > 0 ? (
                    dashboardData.recentDonations.map((donation, index) => (
                      <div key={donation.id || index} className="activity-item">
                        <div className="activity-info">
                          <h4 className="activity-title">{donation.title}</h4>
                          <p className="activity-subtitle">by {donation.author}</p>
                          <p className="activity-date">
                            Submitted: {formatDate(donation.created_at)}
                          </p>
                        </div>
                        <span className={`status-badge ${getStatusBadgeClass(donation.status)}`}>
                          {donation.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No donations yet</p>
                      <Link to="/donate">Donate your first book</Link>
                    </div>
                  )}
                </div>
                {dashboardData.stats.pendingDonations > 0 && (
                  <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', borderTop: '1px solid var(--light-color)' }}>
                    <p className="text-info">
                      You have {dashboardData.stats.pendingDonations} pending donation{dashboardData.stats.pendingDonations !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Sales */}
              <div className="activity-section">
                <h3>Recent Sales</h3>
                <div className="activity-list">
                  {dashboardData.recentSales.length > 0 ? (
                    dashboardData.recentSales.map((sale, index) => (
                      <div key={sale.id || index} className="activity-item">
                        <div className="activity-info">
                          <h4 className="activity-title">
                            {sale.book?.title || sale.title || 'Unknown Title'}
                          </h4>
                          <p className="activity-subtitle">
                            by {sale.book?.author || sale.author || 'Unknown Author'}
                          </p>
                          <p className="activity-date">
                            Listed: {formatDate(sale.created_at)}
                            {sale.price && (
                              <span className="price-display"> - ₹{sale.price}</span>
                            )}
                          </p>
                        </div>
                        <span className={`status-badge ${getStatusBadgeClass(sale.status)}`}>
                          {sale.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <p>No sales yet</p>
                      <Link to="/sell">List your first book for sale</Link>
                    </div>
                  )}
                </div>
                {dashboardData.stats.pendingSales > 0 && (
                  <div style={{ padding: 'var(--spacing-md)', textAlign: 'center', borderTop: '1px solid var(--light-color)' }}>
                    <p className="text-info">
                      You have {dashboardData.stats.pendingSales} pending sale{dashboardData.stats.pendingSales !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;