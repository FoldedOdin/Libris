import React, { useState, useEffect } from 'react';
import { donationsAPI } from '../../api/donations';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewingDonation, setViewingDonation] = useState(null);
  const [actionConfirm, setActionConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  useEffect(() => {
    fetchDonations();
  }, [searchTerm, statusFilter, categoryFilter, pagination.page]);

  const fetchDonations = async () => {
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

      const response = await donationsAPI.getAll(filters);

      if (response.success) {
        setDonations(response.data.results || []);
        setPagination({
          page: pagination.page,
          totalPages: Math.ceil((response.data.count || 0) / 10),
          totalCount: response.data.count || 0
        });
      } else {
        setError(response.error?.message || 'Failed to fetch donations');
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to fetch donations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchDonations();
  };

  const handleApproveDonation = async (donationId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await donationsAPI.approve(donationId);

      if (response.success) {
        setSuccess('Donation approved successfully!');
        setActionConfirm(null);
        fetchDonations();
      } else {
        setError(response.error?.message || 'Failed to approve donation');
      }
    } catch (err) {
      console.error('Error approving donation:', err);
      setError('Failed to approve donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDonation = async (donationId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await donationsAPI.reject(donationId);

      if (response.success) {
        setSuccess('Donation rejected successfully!');
        setActionConfirm(null);
        fetchDonations();
      } else {
        setError(response.error?.message || 'Failed to reject donation');
      }
    } catch (err) {
      console.error('Error rejecting donation:', err);
      setError('Failed to reject donation. Please try again.');
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
      default:
        return 'status-badge status-default';
    }
  };

  const getConditionBadgeClass = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'condition-badge condition-excellent';
      case 'good':
        return 'condition-badge condition-good';
      case 'fair':
        return 'condition-badge condition-fair';
      case 'poor':
        return 'condition-badge condition-poor';
      default:
        return 'condition-badge condition-default';
    }
  };

  const getPendingCount = () => {
    return donations.filter(donation => donation.status === 'pending').length;
  };

  return (
    <div className="donation-management">
      <div className="page-header">
        <h1>Donation Management</h1>
        <div className="header-stats">
          <span className="stat-item">Total: {pagination.totalCount}</span>
          <span className="stat-item pending">Pending: {getPendingCount()}</span>
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
              placeholder="Search by title, author, or user..."
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
        </form>
      </div>

      {/* View Donation Details Modal */}
      {viewingDonation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Donation Details</h2>
              <button 
                className="modal-close"
                onClick={() => setViewingDonation(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="donation-details">
                <div className="detail-row">
                  <label>Title:</label>
                  <span>{viewingDonation.title}</span>
                </div>
                <div className="detail-row">
                  <label>Author:</label>
                  <span>{viewingDonation.author}</span>
                </div>
                <div className="detail-row">
                  <label>Category:</label>
                  <span className="category-badge">{viewingDonation.category}</span>
                </div>
                <div className="detail-row">
                  <label>Condition:</label>
                  <span className={getConditionBadgeClass(viewingDonation.condition)}>
                    {viewingDonation.condition}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span className={getStatusBadgeClass(viewingDonation.status)}>
                    {viewingDonation.status}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Donated by:</label>
                  <span>{viewingDonation.user?.username || 'Unknown User'}</span>
                </div>
                <div className="detail-row">
                  <label>Submitted:</label>
                  <span>{formatDate(viewingDonation.created_at)}</span>
                </div>
                {viewingDonation.description && (
                  <div className="detail-row">
                    <label>Description:</label>
                    <span>{viewingDonation.description}</span>
                  </div>
                )}
              </div>
              
              {viewingDonation.status === 'pending' && (
                <div className="modal-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => setActionConfirm({ type: 'approve', donation: viewingDonation })}
                    disabled={loading}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => setActionConfirm({ type: 'reject', donation: viewingDonation })}
                    disabled={loading}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Confirm {actionConfirm.type === 'approve' ? 'Approval' : 'Rejection'}</h2>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {actionConfirm.type} the donation "{actionConfirm.donation.title}"?
              </p>
              {actionConfirm.type === 'approve' && (
                <p className="text-info">This will add the book to the library inventory.</p>
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
                className={`btn ${actionConfirm.type === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => {
                  if (actionConfirm.type === 'approve') {
                    handleApproveDonation(actionConfirm.donation.id);
                  } else {
                    handleRejectDonation(actionConfirm.donation.id);
                  }
                }}
                disabled={loading}
              >
                {loading ? 'Processing...' : (actionConfirm.type === 'approve' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Donations List */}
      <div className="donations-section">
        {loading && !viewingDonation && !actionConfirm ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="donations-header">
              <h2>Donations ({pagination.totalCount})</h2>
            </div>
            
            {donations.length > 0 ? (
              <>
                <div className="donations-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Category</th>
                        <th>Condition</th>
                        <th>Donated By</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation.id}>
                          <td>
                            <div className="book-details-cell">
                              <strong>{donation.title}</strong>
                              <div className="book-author">by {donation.author}</div>
                            </div>
                          </td>
                          <td>
                            <span className="category-badge">{donation.category}</span>
                          </td>
                          <td>
                            <span className={getConditionBadgeClass(donation.condition)}>
                              {donation.condition}
                            </span>
                          </td>
                          <td>{donation.user?.username || 'Unknown'}</td>
                          <td>
                            <span className={getStatusBadgeClass(donation.status)}>
                              {donation.status}
                            </span>
                          </td>
                          <td>{formatDate(donation.created_at)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-info"
                                onClick={() => setViewingDonation(donation)}
                                disabled={loading}
                              >
                                View
                              </button>
                              {donation.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => setActionConfirm({ type: 'approve', donation })}
                                    disabled={loading}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => setActionConfirm({ type: 'reject', donation })}
                                    disabled={loading}
                                  >
                                    Reject
                                  </button>
                                </>
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
                <p>No donations found.</p>
                {(searchTerm || statusFilter || categoryFilter) && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                      setCategoryFilter('');
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

export default DonationManagement;