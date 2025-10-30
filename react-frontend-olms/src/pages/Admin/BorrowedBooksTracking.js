import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../../api/transactions';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const BorrowedBooksTracking = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState('');
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'
  const [returnConfirm, setReturnConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    if (activeTab === 'current') {
      fetchBorrowedBooks();
    } else {
      fetchBorrowingHistory();
    }
  }, [activeTab, searchTerm, statusFilter, overdueFilter, pagination.page]);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: pagination.page,
        page_size: 10,
        ordering: '-date'
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }
      if (statusFilter) {
        filters.status = statusFilter;
      }
      if (overdueFilter !== '') {
        filters.is_overdue = overdueFilter === 'true';
      }

      const response = await transactionsAPI.getAllBorrowedBooks(filters);

      if (response.success) {
        setBorrowedBooks(response.data.results || []);
        setPagination({
          page: pagination.page,
          totalPages: Math.ceil((response.data.count || 0) / 10),
          totalCount: response.data.count || 0
        });
      } else {
        setError(response.error?.message || 'Failed to fetch borrowed books');
      }
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      setError('Failed to fetch borrowed books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowingHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: pagination.page,
        page_size: 10,
        ordering: '-date'
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }

      const response = await transactionsAPI.getAllBorrowingHistory(filters);

      if (response.success) {
        setBorrowingHistory(response.data.results || []);
        setPagination({
          page: pagination.page,
          totalPages: Math.ceil((response.data.count || 0) / 10),
          totalCount: response.data.count || 0
        });
      } else {
        setError(response.error?.message || 'Failed to fetch borrowing history');
      }
    } catch (err) {
      console.error('Error fetching borrowing history:', err);
      setError('Failed to fetch borrowing history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    if (activeTab === 'current') {
      fetchBorrowedBooks();
    } else {
      fetchBorrowingHistory();
    }
  };

  const handleReturnBook = async (transactionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await transactionsAPI.returnBook(transactionId);

      if (response.success) {
        setSuccess('Book returned successfully!');
        setReturnConfirm(null);
        fetchBorrowedBooks();
      } else {
        setError(response.error?.message || 'Failed to return book');
      }
    } catch (err) {
      console.error('Error returning book:', err);
      setError('Failed to return book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPagination({ page: 1, totalPages: 1, totalCount: 0 });
    setSearchTerm('');
    setStatusFilter('');
    setOverdueFilter('');
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    return dueDate < today;
  };

  const getDaysOverdue = (dueDateString) => {
    if (!dueDateString) return 0;
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getStatusBadgeClass = (transaction) => {
    if (activeTab === 'history') {
      return transaction.transaction_type === 'borrow' ? 
        'status-badge status-borrowed' : 'status-badge status-returned';
    }
    
    if (isOverdue(transaction.due_date)) {
      return 'status-badge status-overdue';
    }
    return 'status-badge status-borrowed';
  };

  const getOverdueCount = () => {
    return borrowedBooks.filter(book => isOverdue(book.due_date)).length;
  };

  return (
    <div className="borrowed-books-tracking">
      <div className="page-header">
        <h1>Borrowed Books Tracking</h1>
        <div className="header-stats">
          <span className="stat-item">
            Current: {activeTab === 'current' ? pagination.totalCount : borrowedBooks.length}
          </span>
          {activeTab === 'current' && (
            <span className="stat-item overdue">Overdue: {getOverdueCount()}</span>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => handleTabChange('current')}
        >
          Currently Borrowed
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Borrowing History
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by book title, author, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
            {activeTab === 'current' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Status</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="renewed">Renewed</option>
                </select>
                <select
                  value={overdueFilter}
                  onChange={(e) => setOverdueFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="">All Books</option>
                  <option value="true">Overdue Only</option>
                  <option value="false">Not Overdue</option>
                </select>
              </>
            )}
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Return Book Confirmation Modal */}
      {returnConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Confirm Return</h2>
            </div>
            <div className="modal-body">
              <p>Mark "{returnConfirm.book_title}" as returned?</p>
              <p className="text-info">This will update the book's availability status.</p>
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setReturnConfirm(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-success"
                onClick={() => handleReturnBook(returnConfirm.id)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Mark as Returned'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books List */}
      <div className="books-section">
        {loading && !returnConfirm ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="books-header">
              <h2>
                {activeTab === 'current' ? 'Currently Borrowed Books' : 'Borrowing History'} 
                ({pagination.totalCount})
              </h2>
            </div>
            
            {(activeTab === 'current' ? borrowedBooks : borrowingHistory).length > 0 ? (
              <>
                <div className="books-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Borrower</th>
                        <th>Borrowed Date</th>
                        <th>Due Date</th>
                        {activeTab === 'current' && <th>Days Overdue</th>}
                        <th>Status</th>
                        {activeTab === 'current' && <th>Actions</th>}
                        {activeTab === 'history' && <th>Returned Date</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === 'current' ? borrowedBooks : borrowingHistory).map((transaction) => (
                        <tr key={transaction.id}>
                          <td>
                            <div className="book-details-cell">
                              <strong>{transaction.book_title || 'N/A'}</strong>
                              <div className="book-author">by {transaction.book_author || 'Unknown'}</div>
                            </div>
                          </td>
                          <td>{transaction.user_name || 'Unknown'}</td>
                          <td>{formatDate(transaction.date)}</td>
                          <td>
                            <span className={isOverdue(transaction.due_date) ? 'overdue-date' : ''}>
                              {formatDate(transaction.due_date)}
                            </span>
                          </td>
                          {activeTab === 'current' && (
                            <td>
                              {isOverdue(transaction.due_date) ? (
                                <span className="overdue-days">{getDaysOverdue(transaction.due_date)} days</span>
                              ) : (
                                <span className="not-overdue">-</span>
                              )}
                            </td>
                          )}
                          <td>
                            <span className={getStatusBadgeClass(transaction)}>
                              {activeTab === 'history' ? transaction.transaction_type : 
                               isOverdue(transaction.due_date) ? 'Overdue' : 'Borrowed'}
                            </span>
                          </td>
                          {activeTab === 'current' && (
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => setReturnConfirm(transaction)}
                                  disabled={loading}
                                >
                                  Mark Returned
                                </button>
                              </div>
                            </td>
                          )}
                          {activeTab === 'history' && (
                            <td>{formatDate(transaction.return_date)}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1 || loading}
                    >
                      Previous
                    </button>
                    <span className="pagination-info">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages || loading}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-data">
                <p>
                  {activeTab === 'current' ? 'No currently borrowed books.' : 'No borrowing history found.'}
                </p>
                {(searchTerm || statusFilter || overdueFilter) && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setOverdueFilter('');
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BorrowedBooksTracking;