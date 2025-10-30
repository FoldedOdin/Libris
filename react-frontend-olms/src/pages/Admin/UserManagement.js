import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api/users';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter, statusFilter, pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: pagination.page,
        page_size: 10
      };

      if (searchTerm) {
        filters.search = searchTerm;
      }
      if (roleFilter) {
        filters.role = roleFilter;
      }
      if (statusFilter !== '') {
        filters.is_active = statusFilter === 'true';
      }

      const response = await usersAPI.getAll(filters);

      if (response.success) {
        setUsers(response.data.results || []);
        setPagination({
          page: pagination.page,
          totalPages: Math.ceil((response.data.count || 0) / 10),
          totalCount: response.data.count || 0
        });
      } else {
        setError(response.error?.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const handleEditUser = (user) => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      role: user.role || 'user',
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setEditingUser(user);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await usersAPI.update(editingUser.id, formData);

      if (response.success) {
        setSuccess('User updated successfully!');
        setEditingUser(null);
        fetchUsers();
      } else {
        setError(response.error?.message || 'Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await usersAPI.delete(userId);

      if (response.success) {
        setSuccess('User deleted successfully!');
        setDeleteConfirm(null);
        fetchUsers();
      } else {
        setError(response.error?.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      setLoading(true);
      setError(null);

      const response = user.is_active 
        ? await usersAPI.deactivateUser(user.id)
        : await usersAPI.activateUser(user.id);

      if (response.success) {
        setSuccess(`User ${user.is_active ? 'deactivated' : 'activated'} successfully!`);
        fetchUsers();
      } else {
        setError(response.error?.message || 'Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadgeClass = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'role-badge role-admin';
      case 'user':
        return 'role-badge role-user';
      default:
        return 'role-badge role-default';
    }
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/admin/dashboard')}
          >
            ← Back
          </button>
          <h1>User Management</h1>
        </div>
        <div className="header-stats">
          <span className="stat-item">Total Users: {pagination.totalCount}</span>
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
              placeholder="Search by username, email, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Edit User Form Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit User</h2>
              <button 
                className="modal-close"
                onClick={() => setEditingUser(null)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">Username *</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="form-checkbox"
                    />
                    Active User
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Confirm Delete</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete user "{deleteConfirm.username}"?</p>
              <p className="text-warning">This action cannot be undone.</p>
            </div>
            <div className="form-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteUser(deleteConfirm.id)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="users-section">
        {loading && !editingUser && !deleteConfirm ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="users-header">
              <h2>Users ({pagination.totalCount})</h2>
            </div>
            
            {users.length > 0 ? (
              <>
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="user-info-cell">
                              <strong>{user.username}</strong>
                              {(user.first_name || user.last_name) && (
                                <div className="user-full-name">
                                  {user.first_name} {user.last_name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>
                            <span className={getRoleBadgeClass(user.role)}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{formatDate(user.date_joined)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEditUser(user)}
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button
                                className={`btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                                onClick={() => handleToggleUserStatus(user)}
                                disabled={loading}
                              >
                                {user.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => setDeleteConfirm(user)}
                                disabled={loading}
                              >
                                Delete
                              </button>
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
                <p>No users found.</p>
                {(searchTerm || roleFilter || statusFilter) && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('');
                      setStatusFilter('');
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

export default UserManagement;