import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { transactionsAPI } from '../../api/transactions';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const BorrowedBooks = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returningBook, setReturningBook] = useState(null);
  const [selectedTab, setSelectedTab] = useState('current'); // 'current' or 'history'
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch borrowed books whenever we navigate to this page
  useEffect(() => {
    fetchBorrowedBooks();
  }, [location.pathname]); // Refetch when route changes

  useEffect(() => {
    if (selectedTab === 'history' && borrowingHistory.length === 0) {
      fetchBorrowingHistory();
    }
  }, [selectedTab]);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await transactionsAPI.getBorrowedBooks();
      const books = response.data?.results || response.data || [];
      setBorrowedBooks(books);
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      setError('Failed to load borrowed books. Please try again.');
      setBorrowedBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowingHistory = async () => {
    try {
      setHistoryLoading(true);
      
      const response = await transactionsAPI.getBorrowingHistory();
      const history = response.data?.results || response.data || [];
      setBorrowingHistory(history);
    } catch (err) {
      console.error('Error fetching borrowing history:', err);
      setError('Failed to load borrowing history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleReturnBook = async (transactionId, bookTitle) => {
    if (!window.confirm(`Are you sure you want to return "${bookTitle}"?`)) {
      return;
    }

    try {
      setReturningBook(transactionId);
      setError('');
      setSuccess('');

      await transactionsAPI.returnBook(transactionId);
      setSuccess(`"${bookTitle}" has been returned successfully!`);
      
      // Refresh the borrowed books list
      fetchBorrowedBooks();
      
      // If history tab is active, refresh history as well
      if (selectedTab === 'history') {
        fetchBorrowingHistory();
      }
    } catch (err) {
      console.error('Error returning book:', err);
      setError(err.response?.data?.error || 'Failed to return book. Please try again.');
    } finally {
      setReturningBook(null);
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

  const isOverdue = (dueDateString) => {
    const days = getDaysUntilDue(dueDateString);
    return days !== null && days < 0;
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'borrowed': return 'status-borrowed';
      case 'returned': return 'status-returned';
      case 'overdue': return 'status-overdue';
      default: return 'status-default';
    }
  };

  const getCurrentBooksStats = () => {
    const total = borrowedBooks.length;
    const overdue = borrowedBooks.filter(book => isOverdue(book.due_date)).length;
    const dueSoon = borrowedBooks.filter(book => {
      const days = getDaysUntilDue(book.due_date);
      return days !== null && days >= 0 && days <= 3;
    }).length;

    return { total, overdue, dueSoon };
  };

  const stats = getCurrentBooksStats();

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="borrowed-books-tracking">
          {/* Page Header */}
          <div className="page-header">
            <h1>My Borrowed Books</h1>
            <div className="header-stats">
              <span className="stat-item">
                {stats.total} books borrowed
              </span>
              {stats.overdue > 0 && (
                <span className="stat-item overdue">
                  {stats.overdue} overdue
                </span>
              )}
              {stats.dueSoon > 0 && (
                <span className="stat-item pending">
                  {stats.dueSoon} due soon
                </span>
              )}
            </div>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${selectedTab === 'current' ? 'active' : ''}`}
              onClick={() => setSelectedTab('current')}
            >
              Currently Borrowed ({stats.total})
            </button>
            <button
              className={`tab-button ${selectedTab === 'history' ? 'active' : ''}`}
              onClick={() => setSelectedTab('history')}
            >
              Borrowing History
            </button>
          </div>

          {/* Current Borrowed Books Tab */}
          {selectedTab === 'current' && (
            <div className="books-section">
              <div className="books-header">
                <h2>Currently Borrowed Books</h2>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : borrowedBooks.length > 0 ? (
                <div className="books-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Borrowed Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowedBooks.map((transaction, index) => {
                        const daysUntilDue = getDaysUntilDue(transaction.due_date);
                        const bookIsOverdue = isOverdue(transaction.due_date);
                        
                        return (
                          <tr key={transaction.id || index}>
                            <td className="book-title-cell">
                              <strong>{transaction.book_title || 'Unknown Title'}</strong>
                              <div className="book-isbn">
                                by {transaction.book_author || 'Unknown Author'}
                              </div>
                            </td>
                            <td>{formatDate(transaction.date || transaction.borrowed_date)}</td>
                            <td>
                              <span className={bookIsOverdue ? 'overdue-date' : ''}>
                                {formatDate(transaction.due_date)}
                              </span>
                              {daysUntilDue !== null && (
                                <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                                  {bookIsOverdue ? (
                                    <span className="overdue-days">
                                      {Math.abs(daysUntilDue)} days overdue
                                    </span>
                                  ) : daysUntilDue <= 3 ? (
                                    <span style={{ color: '#f39c12', fontWeight: '600' }}>
                                      {daysUntilDue} days left
                                    </span>
                                  ) : (
                                    <span className="not-overdue">
                                      {daysUntilDue} days left
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${bookIsOverdue ? 'status-overdue' : 'status-borrowed'}`}>
                                {bookIsOverdue ? 'Overdue' : 'Borrowed'}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  onClick={() => handleReturnBook(transaction.id, transaction.book_title)}
                                  disabled={returningBook === transaction.id}
                                  className="btn btn-success btn-sm"
                                >
                                  {returningBook === transaction.id ? 'Returning...' : 'Return'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <p>You haven't borrowed any books yet</p>
                  <a href="/books" className="btn btn-primary">
                    Browse Books
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Borrowing History Tab */}
          {selectedTab === 'history' && (
            <div className="books-section">
              <div className="books-header">
                <h2>Borrowing History</h2>
              </div>

              {historyLoading ? (
                <LoadingSpinner />
              ) : borrowingHistory.length > 0 ? (
                <div className="books-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Borrowed Date</th>
                        <th>Due Date</th>
                        <th>Returned Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowingHistory.map((transaction, index) => {
                        const wasOverdue = transaction.return_date && 
                          new Date(transaction.return_date) > new Date(transaction.due_date);
                        
                        return (
                          <tr key={transaction.id || index}>
                            <td className="book-title-cell">
                              <strong>{transaction.book_title || 'Unknown Title'}</strong>
                              <div className="book-isbn">
                                by {transaction.book_author || 'Unknown Author'}
                              </div>
                            </td>
                            <td>{formatDate(transaction.date || transaction.borrowed_date)}</td>
                            <td>{formatDate(transaction.due_date)}</td>
                            <td>{formatDate(transaction.return_date)}</td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(
                                transaction.return_date ? 
                                  (wasOverdue ? 'overdue' : 'returned') : 
                                  'borrowed'
                              )}`}>
                                {transaction.return_date ? 
                                  (wasOverdue ? 'Returned Late' : 'Returned') : 
                                  'Borrowed'
                                }
                              </span>
                              {transaction.fine && transaction.fine > 0 && (
                                <div style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-xs)' }}>
                                  <span style={{ color: '#dc3545', fontWeight: '600' }}>
                                    Fine: ${transaction.fine}
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <p>No borrowing history found</p>
                </div>
              )}
            </div>
          )}

          {/* Overdue Notice */}
          {stats.overdue > 0 && selectedTab === 'current' && (
            <div className="error-message" style={{ marginTop: 'var(--spacing-lg)' }}>
              <strong>⚠️ Overdue Notice:</strong> You have {stats.overdue} overdue book{stats.overdue !== 1 ? 's' : ''}. 
              Please return them as soon as possible to avoid additional fines.
            </div>
          )}

          {/* Due Soon Notice */}
          {stats.dueSoon > 0 && selectedTab === 'current' && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              color: '#856404', 
              padding: 'var(--spacing-md)', 
              borderRadius: 'var(--border-radius)', 
              marginTop: 'var(--spacing-lg)',
              border: '1px solid #ffeaa7'
            }}>
              <strong>📅 Reminder:</strong> You have {stats.dueSoon} book{stats.dueSoon !== 1 ? 's' : ''} due within the next 3 days. 
              Consider returning or renewing them soon.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowedBooks;