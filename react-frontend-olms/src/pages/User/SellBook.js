import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { salesAPI } from '../../api/sales';
import { booksAPI } from '../../api/books';
import { useFormValidation, validationSchemas, getFieldErrorClass, renderFieldError } from '../../utils/validation';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const SellBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableBooks, setAvailableBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [mySales, setMySales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [showSalesHistory, setShowSalesHistory] = useState(false);

  // Form validation
  const {
    formData: saleForm,
    errors: saleErrors,
    handleChange,
    handleBlur,
    validateForm: validateSaleForm,
    resetForm: resetSaleForm
  } = useFormValidation(validationSchemas.sale, {
    book_id: '',
    price: '',
    condition: '',
    description: ''
  });

  // Available conditions
  const conditions = [
    { value: 'excellent', label: 'Excellent - Like new' },
    { value: 'good', label: 'Good - Minor wear' },
    { value: 'fair', label: 'Fair - Noticeable wear' },
    { value: 'poor', label: 'Poor - Significant wear' }
  ];

  useEffect(() => {
    fetchAvailableBooks();
  }, []);

  useEffect(() => {
    if (showSalesHistory && mySales.length === 0) {
      fetchMySales();
    }
  }, [showSalesHistory]);

  const fetchAvailableBooks = async () => {
    try {
      setLoadingBooks(true);
      // For this implementation, we'll assume users can sell any book from the catalog
      // In a real system, this might be books they own or have purchased
      const response = await booksAPI.getAll({ available: true, page_size: 100 });
      const books = response.data?.results || response.data || [];
      setAvailableBooks(books);
    } catch (err) {
      console.error('Error fetching available books:', err);
      setError('Failed to load available books. Please try again.');
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchMySales = async () => {
    try {
      setLoadingSales(true);
      const response = await salesAPI.getMySales();
      const sales = response.data?.results || response.data || [];
      setMySales(sales);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to load sales history. Please try again.');
    } finally {
      setLoadingSales(false);
    }
  };

  // No need for separate validation - using validation hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSaleForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const selectedBook = availableBooks.find(book => book.id.toString() === saleForm.book_id);
      if (!selectedBook) {
        setError('Selected book not found');
        return;
      }

      const saleData = {
        book_title: selectedBook.title,
        author: selectedBook.author,
        category: selectedBook.category,
        price: parseFloat(saleForm.price),
        condition: saleForm.condition,
        description: saleForm.description.trim() || ''
      };

      await salesAPI.create(saleData);
      setSuccess('Book listed for sale successfully! It will be reviewed by an administrator.');
      
      // Reset form
      resetSaleForm({
        book_id: '',
        price: '',
        condition: '',
        description: ''
      });

      // Refresh sales history if visible
      if (showSalesHistory) {
        fetchMySales();
      }
    } catch (err) {
      console.error('Error submitting sale:', err);
      setError(err.response?.data?.error || 'Failed to list book for sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  const getSelectedBookDetails = () => {
    if (!saleForm.book_id) return null;
    return availableBooks.find(book => book.id.toString() === saleForm.book_id);
  };

  const selectedBook = getSelectedBookDetails();

  return (
    <div>
      <Navbar />
      <div className="main-content">
        <div className="book-management">
          {/* Page Header */}
          <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/user/dashboard')}
              >
                ← Back
              </button>
              <h1>Sell a Book</h1>
            </div>
            <div className="header-stats">
              <button
                onClick={() => setShowSalesHistory(!showSalesHistory)}
                className="btn btn-secondary btn-sm"
              >
                {showSalesHistory ? 'Hide' : 'View'} Sales History
              </button>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Sell Book Form */}
          <div className="books-section">
            <div className="books-header">
              <h2>List a Book for Sale</h2>
            </div>
            <div className="modal-body">
              {loadingBooks ? (
                <LoadingSpinner />
              ) : (
                <form onSubmit={handleSubmit} className="book-form">
                  <div className="form-group">
                    <label htmlFor="book_id">Select Book to Sell *</label>
                    <select
                      id="book_id"
                      name="book_id"
                      className={getFieldErrorClass('book_id', saleErrors)}
                      value={saleForm.book_id}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="">Choose a book to sell</option>
                      {availableBooks.map(book => (
                        <option key={book.id} value={book.id}>
                          {book.title} by {book.author} ({book.category})
                        </option>
                      ))}
                    </select>
                    {renderFieldError('book_id', saleErrors)}
                  </div>

                  {/* Selected Book Preview */}
                  {selectedBook && (
                    <div className="search-filter-section" style={{ marginBottom: 'var(--spacing-lg)' }}>
                      <h4>Selected Book Details</h4>
                      <div className="book-details">
                        <div className="detail-row">
                          <label>Title:</label>
                          <span>{selectedBook.title}</span>
                        </div>
                        <div className="detail-row">
                          <label>Author:</label>
                          <span>{selectedBook.author}</span>
                        </div>
                        <div className="detail-row">
                          <label>Category:</label>
                          <span className="category-badge">{selectedBook.category}</span>
                        </div>
                        {selectedBook.isbn && (
                          <div className="detail-row">
                            <label>ISBN:</label>
                            <span>{selectedBook.isbn}</span>
                          </div>
                        )}
                        {selectedBook.description && (
                          <div className="detail-row">
                            <label>Description:</label>
                            <span>{selectedBook.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">Selling Price (₹) *</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        className={getFieldErrorClass('price', saleErrors)}
                        value={saleForm.price}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        required
                      />
                      {renderFieldError('price', saleErrors)}
                    </div>
                    <div className="form-group">
                      <label htmlFor="condition">Book Condition *</label>
                      <select
                        id="condition"
                        name="condition"
                        className={getFieldErrorClass('condition', saleErrors)}
                        value={saleForm.condition}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      >
                        <option value="">Select condition</option>
                        {conditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                      {renderFieldError('condition', saleErrors)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Additional Description (Optional)</label>
                    <textarea
                      id="description"
                      name="description"
                      className={getFieldErrorClass('description', saleErrors, 'form-input form-textarea')}
                      value={saleForm.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Any additional details about the book condition, reason for selling, etc..."
                      rows="3"
                    />
                    {renderFieldError('description', saleErrors)}
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? 'Listing...' : 'List Book for Sale'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Sales History */}
          {showSalesHistory && (
            <div className="books-section" style={{ marginTop: 'var(--spacing-lg)' }}>
              <div className="books-header">
                <h2>My Sales History</h2>
              </div>

              {loadingSales ? (
                <LoadingSpinner />
              ) : mySales.length > 0 ? (
                <div className="books-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Price</th>
                        <th>Condition</th>
                        <th>Listed Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mySales.map((sale, index) => {
                        const book = sale.book || {};
                        return (
                          <tr key={sale.id || index}>
                            <td className="book-title-cell">
                              <strong>{book.title || 'Unknown Title'}</strong>
                              <div className="book-isbn">
                                by {book.author || 'Unknown Author'}
                                <span className="category-badge" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                  {book.category || 'Uncategorized'}
                                </span>
                              </div>
                              {sale.description && (
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-color)', marginTop: 'var(--spacing-xs)' }}>
                                  {sale.description}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="price-display">₹{sale.price}</span>
                            </td>
                            <td>
                              <span className={`condition-badge condition-${sale.condition}`}>
                                {sale.condition}
                              </span>
                            </td>
                            <td>{formatDate(sale.created_at)}</td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(sale.status)}`}>
                                {sale.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <p>No sales found</p>
                </div>
              )}
            </div>
          )}

          {/* Information Section */}
          <div className="search-filter-section" style={{ marginTop: 'var(--spacing-lg)' }}>
            <h3>Selling Guidelines</h3>
            <div style={{ color: 'var(--secondary-color)', lineHeight: '1.6' }}>
              <p><strong>Book Selection:</strong> Choose from our catalog of books that you own and would like to sell.</p>
              <p><strong>Pricing:</strong> Set a fair price based on the book's condition and market value.</p>
              <p><strong>Review Process:</strong> All sales listings are reviewed by our administrators before being approved.</p>
              <p><strong>Condition Guidelines:</strong></p>
              <ul style={{ marginLeft: 'var(--spacing-lg)' }}>
                <li><strong>Excellent:</strong> Like new, no visible wear - can command higher prices</li>
                <li><strong>Good:</strong> Minor wear, all pages intact - good resale value</li>
                <li><strong>Fair:</strong> Noticeable wear but readable - moderate pricing recommended</li>
                <li><strong>Poor:</strong> Significant wear - should be priced accordingly</li>
              </ul>
              <p><strong>Commission:</strong> The library may take a small commission from successful sales to support operations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellBook;