import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesAPI } from '../../api/sales';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const SalesManagement = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [viewingSale, setViewingSale] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchSales();
  }, [searchTerm, statusFilter, categoryFilter, pagination.page]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: pagination.page,
        page_size: 10,
        ordering: '-created_at'
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }
      if (statusFilter) {
        filters.status = statusFilter;
      }
      if (categoryFilter) {
        filters.category = categoryFilter;
      }
      if (priceRange.min) {
        filters.price_min = priceRange.min;
      }
      if (priceRange.max) {
        filters.price_max = priceRange.max;
      }

      const response = await salesAPI.getAll(filters);

      if (response.success) {
        setSales(response.data.results || []);
        setPagination({
          page: pagination.page,
          totalPages: Math.ceil((response.data.count || 0) / 10),
          totalCount: response.data.count || 0
        });
      } else {
        setError(response.error?.message || 'Failed to fetch sales');
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to fetch sales. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchSales();
  };

  const handleApproveSale = async (saleId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await salesAPI.approve(saleId);

      if (response.success) {
        setSuccess('Sale approved successfully!');
        setActionConfirm(null);
        fetchSales();
      } else {
        setError(response.error?.message || 'Failed to approve sale');
      }
    } catch (err) {
      console.error('Error approving sale:', err);
      setError('Failed to approve sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSale = async (saleId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await salesAPI.reject(saleId);

      if (response.success) {
        setSuccess('Sale rejected successfully!');
        setActionConfirm(null);
        fetchSales();
      } else {
        setError(response.error?.message || 'Failed to reject sale');
      }
    } catch (err) {
      console.error('Error rejecting sale:', err);
      setError('Failed to reject sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSold = async (saleId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await salesAPI.markAsSold(saleId);

      if (response.success) {
        setSuccess('Sale marked as sold successfully!');
        setActionConfirm(null);
        fetchSales();
      } else {
        setError(response.error?.message || 'Failed to mark sale as sold');
      }
    } catch (err) {
      console.error('Error marking sale as sold:', err);
      setError('Failed to mark sale as sold. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
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
      case 'sold':
        return 'status-badge status-sold';
      default:
        return 'status-badge status-default';
    }
  };

  const getPendingCount = () => {
    return sales.filter(sale => sale.status === 'pending').length;
  };

  const getApprovedCount = () => {
    return sales.filter(sale => sale.status === 'approved').length;
  };

  const getSoldCount = () => {
    return sales.filter(sale => sale.status === 'sold').length;
  };

  return (
    <div className="sales-management">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Back
          </button>
          <h1>Sales Management</h1>
        </div>
        <div className="header-stats">
          <span className="stat-item">Total: {pagination.totalCount}</span>
          <span className="stat-item pending">Pending: {getPendingCount()}</span>
          <span className="stat-item approved">Approved: {getApprovedCount()}</span>
          <span className="stat-item sold">Sold: {getSoldCount()}</span>
        </div>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by book title, author, or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="sold">Sold</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science">Science</option>
              <option value="Technology">Technology</option>
              <option value="History">History</option>
              <option value="Biography">Biography</option>
              <option value="Children">Children</option>
              <option value="Education">Education</option>
            </select>
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              Search
            </button>
          </div>
          
          {/* Price Range Filter */}
          <div className="price-filter-row">
            <label>Price Range:</label>
            <input
              type="number"
              placeholder="Min $"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
              className="form-input price-input"
              min="0"
              step="0.01"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max $"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
              className="form-input price-input"
              min="0"
              step="0.01"
            />
          </div>
        </form>
      </div>

      {/* View Sale Details Modal */}
      {viewingSale && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Sale Details</h2>
              <button 
                className="modal-close"
                onClick={() => setViewingSale(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="sale-details">
                <div className="detail-row">
                  <label>Book Title:</label>
                  <span>{viewingSale.book?.title || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Author:</label>
                  <span>{viewingSale.book?.author || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Category:</label>
                  <span className="category-badge">{viewingSale.book?.category || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <label>Price:</label>
                  <span className="price-display">₹{viewingSale.price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span className={getStatusBadgeClass(viewingSale.status)}>
                    {viewingSale.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Seller:</label>
                  <span>{viewingSale.user?.username || 'Unknown User'}</span>
                </div>
                <div className="detail-row">
                  <label>Listed:</label>
                  <span>{formatDate(viewingSale.created_at)}</span>
                </div>
                {viewingSale.description && (
                  <div className="detail-row">
                    <label>Description:</label>
                    <span>{viewingSale.description}</span>
                  </div>
                )}
              </div>
              
              <div className="modal-actions">
                {viewingSale.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success"
                      onClick={() => setActionConfirm({ type: 'approve', sale: viewingSale })}
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setActionConfirm({ type: 'reject', sale: viewingSale })}
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </>
                )}
                {viewingSale.status === 'approved' && (
                  <button
                    className="btn btn-info"
                    onClick={() => setActionConfirm({ type: 'sold', sale: viewingSale })}
                    disabled={loading}
                  >
                    Mark as Sold
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>
                Confirm {actionConfirm.type === 'approve' ? 'Approval' : 
                        actionConfirm.type === 'reject' ? 'Rejection' : 'Mark as Sold'}
              </h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {actionConfirm.type} the sale of "{actionConfirm.sale.book?.title}"?
              </p>
              {actionConfirm.type === 'approve' && (
                <p className="text-info">This will make the book available for purchase.</p>
              )}
              {actionConfirm.type === 'sold' && (
                <p className="text-info">This will mark the book as sold and remove it from available listings.</p>
              )}
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setActionConfirm(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={`btn ${actionConfirm.type === 'approve' ? 'btn-success' : 
                                 actionConfirm.type === 'reject' ? 'btn-danger' : 'btn-info'}`}
                onClick={() => {
                  if (actionConfirm.type === 'approve') {
                    handleApproveSale(actionConfirm.sale.id);
                  } else if (actionConfirm.type === 'reject') {
                    handleRejectSale(actionConfirm.sale.id);
                  } else {
                    handleMarkAsSold(actionConfirm.sale.id);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 
                 actionConfirm.type === 'approve' ? 'Approve' : 
                 actionConfirm.type === 'reject' ? 'Reject' : 'Mark as Sold'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="sales-section">
        {loading && !viewingSale && !actionConfirm ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="sales-header">
              <h2>Sales ({pagination.totalCount})</h2>
            </div>
            
            {sales.length > 0 ? (
              <>
                <div className="sales-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Seller</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>
                            <div className="book-details-cell">
                              <strong>{sale.book?.title || 'N/A'}</strong>
                              <div className="book-author">by {sale.book?.author || 'Unknown'}</div>
                            </div>
                          </td>
                          <td>
                            <span className="category-badge">{sale.book?.category || 'N/A'}</span>
                          </td>
                          <td>
                            <span className="price-display">₹{sale.price ? parseFloat(sale.price).toFixed(2) : '0.00'}</span>
                          </td>
                          <td>{sale.user?.username || 'Unknown'}</td>
                          <td>
                            <span className={getStatusBadgeClass(sale.status)}>
                              {sale.status}
                            </span>
                          </td>
                          <td>{formatDate(sale.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => setViewingSale(sale)}
                                disabled={loading}
                              >
                                View
                              </button>
                              {sale.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => setActionConfirm({ type: 'approve', sale })}
                                    disabled={loading}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => setActionConfirm({ type: 'reject', sale })}
                                    disabled={loading}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {sale.status === 'approved' && (
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => setActionConfirm({ type: 'sold', sale })}
                                  disabled={loading}
                                >
                                  Mark Sold
                                </button>
                              )}
                            </div>
                          </td>
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
                <p>No sales found.</p>
                {(searchTerm || statusFilter || categoryFilter || priceRange.min || priceRange.max) && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setCategoryFilter('');
                      setPriceRange({ min: '', max: '' });
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

export default SalesManagement;