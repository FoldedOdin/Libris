import React, { useState, useEffect } from 'react';
import { booksAPI } from '../../api/books';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalCount: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    stock: 1,
    description: '',
    price: 0
  });

  useEffect(() => {
    fetchBooks();
  }, [searchTerm, categoryFilter, availabilityFilter, pagination.page]);

  const fetchBooks = async () => {
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
      if (categoryFilter) {
        filters.category = categoryFilter;
      }
      if (availabilityFilter !== '') {
        filters.available = availabilityFilter === 'true';
      }

      const response = await booksAPI.getAll(filters);

      if (response.success) {
        setBooks(response.data.results || []);
        setPagination({
          page: pagination.page,
          totalPages: Math.ceil((response.data.count || 0) / 10),
          totalCount: response.data.count || 0
        });
      } else {
        setError(response.error?.message || 'Failed to fetch books');
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchBooks();
  };

  const handleAddBook = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      stock: 1,
      description: '',
      price: 0
    });
    setEditingBook(null);
    setShowAddForm(true);
  };

  const handleEditBook = (book) => {
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || '',
      stock: book.stock || 1,
      description: book.description || '',
      price: book.price || 0
    });
    setEditingBook(book);
    setShowAddForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      let response;
      if (editingBook) {
        response = await booksAPI.update(editingBook.id, formData);
      } else {
        response = await booksAPI.create(formData);
      }

      if (response.success) {
        setSuccess(editingBook ? 'Book updated successfully!' : 'Book added successfully!');
        setShowAddForm(false);
        setEditingBook(null);
        fetchBooks();
      } else {
        setError(response.error?.message || 'Failed to save book');
      }
    } catch (err) {
      console.error('Error saving book:', err);
      setError('Failed to save book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await booksAPI.delete(bookId);

      if (response.success) {
        setSuccess('Book deleted successfully!');
        setDeleteConfirm(null);
        fetchBooks();
      } else {
        setError(response.error?.message || 'Failed to delete book');
      }
    } catch (err) {
      console.error('Error deleting book:', err);
      setError('Failed to delete book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    });
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="book-management">
      <div className="page-header">
        <h1>Book Management</h1>
        <button 
          className="btn btn-primary"
          onClick={handleAddBook}
          disabled={loading}
        >
          Add New Book
        </button>
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {/* Search and Filter Section */}
      <div className="search-filter-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <input
              type="text"
              placeholder="Search by title, author, or ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input search-input"
            />
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
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Books</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Add/Edit Book Form Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="book-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="author">Author *</label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="isbn">ISBN</label>
                  <input
                    type="text"
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science">Science</option>
                    <option value="Technology">Technology</option>
                    <option value="History">History</option>
                    <option value="Biography">Biography</option>
                    <option value="Children">Children</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stock">Stock Quantity *</label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingBook ? 'Update Book' : 'Add Book')}
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
              <p>Are you sure you want to delete "{deleteConfirm.title}"?</p>
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
                onClick={() => handleDeleteBook(deleteConfirm.id)}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Books List */}
      <div className="books-section">
        {loading && !showAddForm && !deleteConfirm ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="books-header">
              <h2>Books ({pagination.totalCount})</h2>
            </div>
            
            {books.length > 0 ? (
              <>
                <div className="books-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Available</th>
                        <th>Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((book) => (
                        <tr key={book.id}>
                          <td>
                            <div className="book-title-cell">
                              <strong>{book.title}</strong>
                              {book.isbn && <div className="book-isbn">ISBN: {book.isbn}</div>}
                            </div>
                          </td>
                          <td>{book.author}</td>
                          <td>
                            <span className="category-badge">{book.category}</span>
                          </td>
                          <td>{book.stock}</td>
                          <td>
                            <span className={`availability-badge ${book.is_available ? 'available' : 'unavailable'}`}>
                              {book.is_available ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td>${book.price ? parseFloat(book.price).toFixed(2) : '0.00'}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEditBook(book)}
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => setDeleteConfirm(book)}
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
                <p>No books found.</p>
                {(searchTerm || categoryFilter || availabilityFilter) && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('');
                      setAvailabilityFilter('');
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

export default BookManagement;