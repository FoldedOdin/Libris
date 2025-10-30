import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../api/books';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import SuccessMessage from '../../components/common/SuccessMessage';

const BookCatalog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedBook, setSelectedBook] = useState(null);
  const [showBookDetails, setShowBookDetails] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 12
  });

  // Available categories (could be fetched from API)
  const categories = [
    'Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 
    'Biography', 'Mystery', 'Romance', 'Fantasy', 'Self-Help',
    'Business', 'Health', 'Travel', 'Art', 'Religion', 'Philosophy'
  ];

  useEffect(() => {
    fetchBooks();
  }, [pagination.currentPage, selectedCategory]);

  useEffect(() => {
    // Reset to first page when search term or category changes
    if (pagination.currentPage !== 1) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    } else {
      fetchBooks();
    }
  }, [searchTerm, selectedCategory]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');

      const filters = {
        page: pagination.currentPage,
        page_size: pagination.pageSize,
        available: true // Only show available books
      };

      if (searchTerm.trim()) {
        filters.search = searchTerm.trim();
      }

      if (selectedCategory) {
        filters.category = selectedCategory;
      }

      console.log('📡 Fetching books with filters:', filters);
      const response = await booksAPI.getAll(filters);
      const data = response.data;
      console.log('📡 API Response:', data);

      if (data.results) {
        // Paginated response
        console.log('📚 Setting books (paginated):', data.results.length, 'books');
        setBooks(data.results);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(data.count / pagination.pageSize),
          totalCount: data.count
        }));
      } else {
        // Non-paginated response
        console.log('📚 Setting books (non-paginated):', Array.isArray(data) ? data.length : 0, 'books');
        setBooks(Array.isArray(data) ? data : []);
        setPagination(prev => ({
          ...prev,
          totalPages: 1,
          totalCount: Array.isArray(data) ? data.length : 0
        }));
      }
    } catch (err) {
      console.error('🔴 Error fetching books:', err);
      setError('Failed to load books. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowingBook(bookId);
      setError('');
      setSuccess('');

      console.log('🔵 BEFORE BORROW - Book state:', books.find(b => b.id === bookId));
      
      const response = await booksAPI.borrow(bookId);
      console.log('🟢 BORROW RESPONSE:', response);
      console.log('🟢 BORROW RESPONSE DATA:', response.data);
      console.log('🟢 BORROW RESPONSE ERROR:', response.error);
      
      // Check if the response indicates failure
      if (!response.success || response.error) {
        console.error('🔴 BORROW FAILED:', response.error);
        throw new Error(response.error?.userMessage || response.error?.message || 'Borrow failed');
      }
      
      // Refresh the books list to update availability
      console.log('🔄 Fetching updated books...');
      await fetchBooks();
      
      // Use setTimeout to check state after React has updated
      setTimeout(() => {
        console.log('🟢 AFTER FETCH (delayed) - Book state:', books.find(b => b.id === bookId));
      }, 100);
      
      setSuccess('Book borrowed successfully!');
      
      // Close book details modal if open
      setShowBookDetails(false);
      setSelectedBook(null);
    } catch (err) {
      console.error('🔴 Error borrowing book:', err);
      console.error('🔴 Error response:', err.response);
      console.error('🔴 Error response data:', err.response?.data);
      console.error('🔴 Error message:', err.message);
      
      // Show the actual error message from backend
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.response?.data?.detail ||
                          'Failed to borrow book. Please try again.';
      setError(errorMessage);
    } finally {
      setBorrowingBook(null);
    }
  };

  const openBookDetails = (book) => {
    setSelectedBook(book);
    setShowBookDetails(true);
  };

  const closeBookDetails = () => {
    setShowBookDetails(false);
    setSelectedBook(null);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const BookCard = ({ book }) => (
    <div className="book-card">
      <div className="book-image">
        <span>📚</span>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <div className="book-details">
          <span className="category-badge">{book.category}</span>
          <p className="book-stock">Available: {book.available_copies || 0} / {book.total_copies || 0}</p>
          {book.description && (
            <p className="book-description">
              {book.description.length > 100 
                ? `${book.description.substring(0, 100)}...` 
                : book.description
              }
            </p>
          )}
        </div>
        <div className="book-actions">
          <button 
            onClick={() => openBookDetails(book)}
            className="btn btn-secondary btn-sm"
          >
            View Details
          </button>
          <button 
            onClick={() => handleBorrowBook(book.id)}
            disabled={borrowingBook === book.id || !book.is_available || book.available_copies <= 0}
            className="btn btn-primary btn-sm"
          >
            {borrowingBook === book.id ? 'Borrowing...' : 'Borrow'}
          </button>
        </div>
      </div>
    </div>
  );

  const BookListItem = ({ book }) => (
    <div className="book-list-item">
      <div className="book-list-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        <span className="category-badge">{book.category}</span>
        <p className="book-stock">Available: {book.available_copies || 0} / {book.total_copies || 0}</p>
        {book.description && (
          <p className="book-description">
            {book.description.length > 200 
              ? `${book.description.substring(0, 200)}...` 
              : book.description
            }
          </p>
        )}
      </div>
      <div className="book-list-actions">
        <button 
          onClick={() => openBookDetails(book)}
          className="btn btn-secondary btn-sm"
        >
          View Details
        </button>
        <button 
          onClick={() => handleBorrowBook(book.id)}
          disabled={borrowingBook === book.id || !book.is_available || book.available_copies <= 0}
          className="btn btn-primary btn-sm"
        >
          {borrowingBook === book.id ? 'Borrowing...' : 'Borrow'}
        </button>
      </div>
    </div>
  );

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
              <h1>Book Catalog</h1>
            </div>
            <div className="header-stats">
              <span className="stat-item">
                {pagination.totalCount} books available
              </span>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-row">
                <div className="form-group search-input">
                  <label htmlFor="search">Search Books</label>
                  <input
                    type="text"
                    id="search"
                    className="form-input"
                    placeholder="Search by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    className="form-input"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="view-mode">View</label>
                  <select
                    id="view-mode"
                    className="form-input"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                  </select>
                </div>

                <div className="form-group">
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                </div>
              </div>
              
              {(searchTerm || selectedCategory) && (
                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <button 
                    type="button" 
                    onClick={clearFilters}
                    className="btn btn-secondary btn-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Books Section */}
          <div className="books-section">
            <div className="books-header">
              <h2>Available Books</h2>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : books.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'book-grid' : 'book-list'}>
                  {books.map(book => 
                    viewMode === 'grid' ? (
                      <BookCard key={book.id} book={book} />
                    ) : (
                      <BookListItem key={book.id} book={book} />
                    )
                  )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="btn btn-secondary btn-sm"
                    >
                      Previous
                    </button>
                    
                    <span className="pagination-info">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="btn btn-secondary btn-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-data">
                <p>No books found</p>
                {(searchTerm || selectedCategory) && (
                  <button onClick={clearFilters} className="btn btn-primary">
                    Clear filters to see all books
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Details Modal */}
      {showBookDetails && selectedBook && (
        <div className="modal-overlay" onClick={closeBookDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Details</h2>
              <button onClick={closeBookDetails} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
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
                <div className="detail-row">
                  <label>Available Copies:</label>
                  <span>{selectedBook.available_copies || 0} / {selectedBook.total_copies || 0}</span>
                </div>
                {selectedBook.price && (
                  <div className="detail-row">
                    <label>Price:</label>
                    <span className="price-display">₹{selectedBook.price}</span>
                  </div>
                )}
                {selectedBook.description && (
                  <div className="detail-row">
                    <label>Description:</label>
                    <span>{selectedBook.description}</span>
                  </div>
                )}
                <div className="detail-row">
                  <label>Availability:</label>
                  <span className={`availability-badge ${selectedBook.is_available ? 'available' : 'unavailable'}`}>
                    {selectedBook.is_available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  onClick={() => handleBorrowBook(selectedBook.id)}
                  disabled={borrowingBook === selectedBook.id || !selectedBook.is_available || selectedBook.available_copies <= 0}
                  className="btn btn-primary"
                >
                  {borrowingBook === selectedBook.id ? 'Borrowing...' : 'Borrow This Book'}
                </button>
                <button onClick={closeBookDetails} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;