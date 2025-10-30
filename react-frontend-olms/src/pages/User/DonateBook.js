import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { donationsAPI } from '../../api/donations';
import { transactionsAPI } from '../../api/transactions';
import { useFormValidation, validationSchemas, getFieldErrorClass, renderFieldError } from '../../utils/validation';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const DonateBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [donationType, setDonationType] = useState('new'); // 'new' or 'borrowed'
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loadingBorrowedBooks, setLoadingBorrowedBooks] = useState(false);
  const [myDonations, setMyDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [showDonationHistory, setShowDonationHistory] = useState(false);

  // Form validation for new book donation
  const {
    formData: newBookForm,
    errors: newBookErrors,
    handleChange: handleNewBookChange,
    handleBlur: handleNewBookBlur,
    validateForm: validateNewBookForm,
    resetForm: resetNewBookForm
  } = useFormValidation(validationSchemas.donation, {
    title: '',
    author: '',
    category: '',
    condition: '',
    description: ''
  });

  // Form validation for borrowed book donation
  const {
    formData: borrowedBookForm,
    errors: borrowedBookErrors,
    handleChange: handleBorrowedBookChange,
    handleBlur: handleBorrowedBookBlur,
    validateForm: validateBorrowedBookForm,
    resetForm: resetBorrowedBookForm
  } = useFormValidation(validationSchemas.sale, {
    borrowed_book_id: '',
    condition: '',
    description: ''
  });

  // Available categories and conditions
  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
    'Biography', 'Mystery', 'Romance', 'Fantasy', 'Self-Help',
    'Business', 'Health', 'Travel', 'Art', 'Religion', 'Philosophy'
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent - Like new' },
    { value: 'good', label: 'Good - Minor wear' },
    { value: 'fair', label: 'Fair - Noticeable wear' },
    { value: 'poor', label: 'Poor - Significant wear' }
  ];

  useEffect(() => {
    if (donationType === 'borrowed') {
      fetchBorrowedBooks();
    }
  }, [donationType]);

  useEffect(() => {
    if (showDonationHistory && myDonations.length === 0) {
      fetchMyDonations();
    }
  }, [showDonationHistory]);

  const fetchBorrowedBooks = async () => {
    try {
      setLoadingBorrowedBooks(true);
      const response = await transactionsAPI.getBorrowedBooks();
      const books = response.data?.results || response.data || [];
      setBorrowedBooks(books);
    } catch (err) {
      console.error('Error fetching borrowed books:', err);
      setError('Failed to load borrowed books. Please try again.');
    } finally {
      setLoadingBorrowedBooks(false);
    }
  };

  const fetchMyDonations = async () => {
    try {
      setLoadingDonations(true);
      const response = await donationsAPI.getMyDonations();
      const donations = response.data?.results || response.data || [];
      setMyDonations(donations);
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load donation history. Please try again.');
    } finally {
      setLoadingDonations(false);
    }
  };

  // No need for separate change handlers - using validation hooks

  const handleNewBookSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateNewBookForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const donationData = {
        book_title: newBookForm.title.trim(),
        author: newBookForm.author.trim(),
        category: newBookForm.category || null,
        condition: newBookForm.condition,
        description: newBookForm.description.trim() || ''
      };

      await donationsAPI.create(donationData);
      setSuccess('Book donation submitted successfully! It will be reviewed by an administrator.');
      
      // Reset form
      resetNewBookForm({
        title: '',
        author: '',
        category: '',
        condition: '',
        description: ''
      });

      // Refresh donation history if visible
      if (showDonationHistory) {
        fetchMyDonations();
      }
    } catch (err) {
      console.error('Error submitting donation:', err);
      setError(err.response?.data?.error || 'Failed to submit donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowedBookSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBorrowedBookForm()) {
      setError('Please fix the validation errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const selectedTransaction = borrowedBooks.find(
        book => book.id.toString() === borrowedBookForm.borrowed_book_id
      );

      if (!selectedTransaction) {
        setError('Selected book not found');
        return;
      }

      const book = selectedTransaction.book || {};
      const donationData = {
        book_title: book.title || 'Unknown Title',
        author: book.author || 'Unknown Author',
        category: book.category || null,
        condition: borrowedBookForm.condition,
        description: borrowedBookForm.description.trim() || '',
        borrowed_book_id: borrowedBookForm.borrowed_book_id
      };

      await donationsAPI.create(donationData);
      setSuccess('Borrowed book donation submitted successfully! It will be reviewed by an administrator.');
      
      // Reset form
      resetBorrowedBookForm({
        borrowed_book_id: '',
        condition: '',
        description: ''
      });

      // Refresh borrowed books and donation history
      fetchBorrowedBooks();
      if (showDonationHistory) {
        fetchMyDonations();
      }
    } catch (err) {
      console.error('Error submitting borrowed book donation:', err);
      setError(err.response?.data?.error || 'Failed to submit donation. Please try again.');
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
      default: return 'status-default';
    }
  };

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
              <h1>Donate a Book</h1>
            </div>
            <div className="header-stats">
              <button
                onClick={() => setShowDonationHistory(!showDonationHistory)}
                className="btn btn-secondary btn-sm"
              >
                {showDonationHistory ? 'Hide' : 'View'} Donation History
              </button>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Donation Type Selection */}
          <div className="search-filter-section">
            <h2>Choose Donation Type</h2>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="donationType"
                    value="new"
                    checked={donationType === 'new'}
                    onChange={(e) => setDonationType(e.target.value)}
                    style={{ marginRight: 'var(--spacing-xs)' }}
                  />
                  Donate a new book
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="radio"
                    name="donationType"
                    value="borrowed"
                    checked={donationType === 'borrowed'}
                    onChange={(e) => setDonationType(e.target.value)}
                    style={{ marginRight: 'var(--spacing-xs)' }}
                  />
                  Donate a borrowed book
                </label>
              </div>
            </div>
          </div>

          {/* New Book Donation Form */}
          {donationType === 'new' && (
            <div className="books-section">
              <div className="books-header">
                <h2>Donate a New Book</h2>
              </div>
              <div className="modal-body">
                <form onSubmit={handleNewBookSubmit} className="book-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="title">Book Title *</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        className={getFieldErrorClass('title', newBookErrors)}
                        value={newBookForm.title}
                        onChange={handleNewBookChange}
                        onBlur={handleNewBookBlur}
                        placeholder="Enter book title"
                        required
                      />
                      {renderFieldError('title', newBookErrors)}
                    </div>
                    <div className="form-group">
                      <label htmlFor="author">Author *</label>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        className={getFieldErrorClass('author', newBookErrors)}
                        value={newBookForm.author}
                        onChange={handleNewBookChange}
                        onBlur={handleNewBookBlur}
                        placeholder="Enter author name"
                        required
                      />
                      {renderFieldError('author', newBookErrors)}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="category">Category *</label>
                      <select
                        id="category"
                        name="category"
                        className={getFieldErrorClass('category', newBookErrors)}
                        value={newBookForm.category}
                        onChange={handleNewBookChange}
                        onBlur={handleNewBookBlur}
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      {renderFieldError('category', newBookErrors)}
                    </div>
                    <div className="form-group">
                      <label htmlFor="condition">Condition *</label>
                      <select
                        id="condition"
                        name="condition"
                        className={getFieldErrorClass('condition', newBookErrors)}
                        value={newBookForm.condition}
                        onChange={handleNewBookChange}
                        onBlur={handleNewBookBlur}
                        required
                      >
                        <option value="">Select condition</option>
                        {conditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                      {renderFieldError('condition', newBookErrors)}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea
                      id="description"
                      name="description"
                      className={getFieldErrorClass('description', newBookErrors, 'form-input form-textarea')}
                      value={newBookForm.description}
                      onChange={handleNewBookChange}
                      onBlur={handleNewBookBlur}
                      placeholder="Any additional details about the book..."
                      rows="3"
                    />
                    {renderFieldError('description', newBookErrors)}
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary"
                    >
                      {loading ? 'Submitting...' : 'Submit Donation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Borrowed Book Donation Form */}
          {donationType === 'borrowed' && (
            <div className="books-section">
              <div className="books-header">
                <h2>Donate a Borrowed Book</h2>
              </div>
              <div className="modal-body">
                {loadingBorrowedBooks ? (
                  <LoadingSpinner />
                ) : borrowedBooks.length > 0 ? (
                  <form onSubmit={handleBorrowedBookSubmit} className="book-form">
                    <div className="form-group">
                      <label htmlFor="borrowed_book_id">Select Borrowed Book *</label>
                      <select
                        id="borrowed_book_id"
                        name="borrowed_book_id"
                        className={getFieldErrorClass('borrowed_book_id', borrowedBookErrors)}
                        value={borrowedBookForm.borrowed_book_id}
                        onChange={handleBorrowedBookChange}
                        onBlur={handleBorrowedBookBlur}
                        required
                      >
                        <option value="">Choose a book to donate</option>
                        {borrowedBooks.map(transaction => {
                          const book = transaction.book || {};
                          return (
                            <option key={transaction.id} value={transaction.id}>
                              {book.title || 'Unknown Title'} by {book.author || 'Unknown Author'}
                            </option>
                          );
                        })}
                      </select>
                      {renderFieldError('borrowed_book_id', borrowedBookErrors)}
                    </div>

                    <div className="form-group">
                      <label htmlFor="borrowed_condition">Condition *</label>
                      <select
                        id="borrowed_condition"
                        name="condition"
                        className={getFieldErrorClass('condition', borrowedBookErrors)}
                        value={borrowedBookForm.condition}
                        onChange={handleBorrowedBookChange}
                        onBlur={handleBorrowedBookBlur}
                        required
                      >
                        <option value="">Select condition</option>
                        {conditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                      {renderFieldError('condition', borrowedBookErrors)}
                    </div>

                    <div className="form-group">
                      <label htmlFor="borrowed_description">Description (Optional)</label>
                      <textarea
                        id="borrowed_description"
                        name="description"
                        className={getFieldErrorClass('description', borrowedBookErrors, 'form-input form-textarea')}
                        value={borrowedBookForm.description}
                        onChange={handleBorrowedBookChange}
                        onBlur={handleBorrowedBookBlur}
                        placeholder="Any additional details about the book condition..."
                        rows="3"
                      />
                      {renderFieldError('description', borrowedBookErrors)}
                    </div>

                    <div className="form-actions">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                      >
                        {loading ? 'Submitting...' : 'Submit Donation'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="no-data">
                    <p>You don't have any borrowed books to donate</p>
                    <a href="/books" className="btn btn-primary">
                      Browse Books to Borrow
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Donation History */}
          {showDonationHistory && (
            <div className="books-section" style={{ marginTop: 'var(--spacing-lg)' }}>
              <div className="books-header">
                <h2>My Donation History</h2>
              </div>

              {loadingDonations ? (
                <LoadingSpinner />
              ) : myDonations.length > 0 ? (
                <div className="books-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Book Details</th>
                        <th>Condition</th>
                        <th>Submitted Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myDonations.map((donation, index) => (
                        <tr key={donation.id || index}>
                          <td className="book-title-cell">
                            <strong>{donation.title}</strong>
                            <div className="book-isbn">
                              by {donation.author}
                              <span className="category-badge" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                {donation.category}
                              </span>
                            </div>
                            {donation.description && (
                              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--secondary-color)', marginTop: 'var(--spacing-xs)' }}>
                                {donation.description}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`condition-badge condition-${donation.condition}`}>
                              {donation.condition}
                            </span>
                          </td>
                          <td>{formatDate(donation.created_at)}</td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(donation.status)}`}>
                              {donation.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <p>No donations found</p>
                </div>
              )}
            </div>
          )}

          {/* Information Section */}
          <div className="search-filter-section" style={{ marginTop: 'var(--spacing-lg)' }}>
            <h3>Donation Guidelines</h3>
            <div style={{ color: 'var(--secondary-color)', lineHeight: '1.6' }}>
              <p><strong>New Book Donations:</strong> Donate books you own to help expand our library collection.</p>
              <p><strong>Borrowed Book Donations:</strong> If you've borrowed a book and would like to donate it instead of returning it, you can do so here.</p>
              <p><strong>Review Process:</strong> All donations are reviewed by our administrators before being added to the library collection.</p>
              <p><strong>Condition Guidelines:</strong></p>
              <ul style={{ marginLeft: 'var(--spacing-lg)' }}>
                <li><strong>Excellent:</strong> Like new, no visible wear</li>
                <li><strong>Good:</strong> Minor wear, all pages intact</li>
                <li><strong>Fair:</strong> Noticeable wear but readable</li>
                <li><strong>Poor:</strong> Significant wear, may have missing pages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonateBook;