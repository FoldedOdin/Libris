// Books API integration tests
import { booksAPI, bookFilters } from '../books';
import apiClient from '../index';
import { 
  mockApiResponses, 
  setupMockLocalStorage,
  createNetworkError,
  createServerError,
  createMockBook
} from '../../utils/testUtils';

// Mock axios
jest.mock('../index');

describe('Books API Integration Tests', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    jest.clearAllMocks();
  });

  describe('Book Filters', () => {
    test('should build search parameters correctly', () => {
      const filters = {
        search: 'test book',
        title: 'Test Title',
        author: 'Test Author',
        category: 'Fiction',
        isbn: '1234567890',
        available: true,
        ordering: 'title',
        page: 2,
        page_size: 20
      };

      const params = bookFilters.buildSearchParams(filters);
      
      expect(params).toContain('search=test%20book');
      expect(params).toContain('title=Test%20Title');
      expect(params).toContain('author=Test%20Author');
      expect(params).toContain('category=Fiction');
      expect(params).toContain('isbn=1234567890');
      expect(params).toContain('available=true');
      expect(params).toContain('ordering=title');
      expect(params).toContain('page=2');
      expect(params).toContain('page_size=20');
    });

    test('should handle empty filters', () => {
      const params = bookFilters.buildSearchParams({});
      expect(params).toBe('');
    });

    test('should handle partial filters', () => {
      const filters = { search: 'test', category: 'Fiction' };
      const params = bookFilters.buildSearchParams(filters);
      
      expect(params).toContain('search=test');
      expect(params).toContain('category=Fiction');
      expect(params).not.toContain('title=');
      expect(params).not.toContain('author=');
    });
  });

  describe('Basic CRUD Operations', () => {
    test('should get all books successfully', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/books/');
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(2);
      expect(result.data.results[0].title).toBe('Test Book 1');
    });

    test('should get all books with filters', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const filters = { category: 'Fiction', available: true };
      const result = await booksAPI.getAll(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/books/?category=Fiction&available=true');
      expect(result.success).toBe(true);
    });

    test('should get book by ID successfully', async () => {
      const mockResponse = mockApiResponses.books.getById.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/books/1/');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(result.data.title).toBe('Test Book 1');
    });

    test('should handle book not found', async () => {
      const mockError = mockApiResponses.books.getById.notFound;
      apiClient.get.mockRejectedValue(mockError);

      const result = await booksAPI.getById(999);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('not_found');
    });

    test('should create book successfully', async () => {
      const bookData = createMockBook({ title: 'New Book', author: 'New Author' });
      const mockResponse = mockApiResponses.books.create.success;
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await booksAPI.create(bookData);

      expect(apiClient.post).toHaveBeenCalledWith('/books/', bookData);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('New Book');
    });

    test('should handle create book validation errors', async () => {
      const invalidBookData = { author: 'Author without title' };
      const mockError = mockApiResponses.books.create.error;
      apiClient.post.mockRejectedValue(mockError);

      const result = await booksAPI.create(invalidBookData);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('validation');
    });

    test('should update book successfully', async () => {
      const bookData = { title: 'Updated Book Title' };
      const mockResponse = { data: { ...createMockBook(), ...bookData } };
      apiClient.put.mockResolvedValue(mockResponse);

      const result = await booksAPI.update(1, bookData);

      expect(apiClient.put).toHaveBeenCalledWith('/books/1/', bookData);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Updated Book Title');
    });

    test('should delete book successfully', async () => {
      apiClient.delete.mockResolvedValue({ data: { message: 'Book deleted successfully' } });

      const result = await booksAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/books/1/');
      expect(result.success).toBe(true);
    });
  });

  describe('Borrowing Operations', () => {
    test('should borrow book successfully', async () => {
      const mockResponse = mockApiResponses.books.borrow.success;
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await booksAPI.borrow(1);

      expect(apiClient.post).toHaveBeenCalledWith('/books/1/borrow/', {});
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Book borrowed successfully');
      expect(result.data.transaction_id).toBe(1);
    });

    test('should borrow book with additional data', async () => {
      const borrowData = { notes: 'Urgent request' };
      const mockResponse = mockApiResponses.books.borrow.success;
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await booksAPI.borrow(1, borrowData);

      expect(apiClient.post).toHaveBeenCalledWith('/books/1/borrow/', borrowData);
      expect(result.success).toBe(true);
    });

    test('should handle book unavailable for borrowing', async () => {
      const mockError = mockApiResponses.books.borrow.unavailable;
      apiClient.post.mockRejectedValue(mockError);

      const result = await booksAPI.borrow(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('validation');
    });

    test('should return book successfully', async () => {
      const mockResponse = { data: { message: 'Book returned successfully' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await booksAPI.return(1);

      expect(apiClient.post).toHaveBeenCalledWith('/books/1/return/', {});
      expect(result.success).toBe(true);
    });

    test('should return book with additional data', async () => {
      const returnData = { condition: 'Good', notes: 'No damage' };
      const mockResponse = { data: { message: 'Book returned successfully' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await booksAPI.return(1, returnData);

      expect(apiClient.post).toHaveBeenCalledWith('/books/1/return/', returnData);
      expect(result.success).toBe(true);
    });
  });

  describe('Search and Filtering Operations', () => {
    test('should search books by query', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.search('test query');

      expect(apiClient.get).toHaveBeenCalledWith('/books/?search=test%20query');
      expect(result.success).toBe(true);
    });

    test('should search books by title', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.searchByTitle('Test Book');

      expect(apiClient.get).toHaveBeenCalledWith('/books/?title=Test%20Book');
      expect(result.success).toBe(true);
    });

    test('should search books by author', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.searchByAuthor('Test Author');

      expect(apiClient.get).toHaveBeenCalledWith('/books/?author=Test%20Author');
      expect(result.success).toBe(true);
    });

    test('should search books by category', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.searchByCategory('Fiction');

      expect(apiClient.get).toHaveBeenCalledWith('/books/?category=Fiction');
      expect(result.success).toBe(true);
    });

    test('should get available books only', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.getAvailableBooks();

      expect(apiClient.get).toHaveBeenCalledWith('/books/?available=true');
      expect(result.success).toBe(true);
    });

    test('should get book categories', async () => {
      const mockResponse = { data: ['Fiction', 'Non-Fiction', 'Science', 'History'] };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.getCategories();

      expect(apiClient.get).toHaveBeenCalledWith('/books/categories/');
      expect(result.success).toBe(true);
      expect(result.data).toContain('Fiction');
    });

    test('should filter books with complex filters', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const filters = {
        category: 'Fiction',
        available: true,
        ordering: 'title',
        search: 'test'
      };

      const result = await booksAPI.filterBooks(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/books/?category=Fiction&available=true&ordering=title&search=test');
      expect(result.success).toBe(true);
    });
  });

  describe('Pagination', () => {
    test('should get specific page', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.getPage(2, 15);

      expect(apiClient.get).toHaveBeenCalledWith('/books/?page=2&page_size=15');
      expect(result.success).toBe(true);
    });

    test('should get page with filters', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const filters = { category: 'Fiction' };
      const result = await booksAPI.getPage(1, 10, filters);

      expect(apiClient.get).toHaveBeenCalledWith('/books/?category=Fiction&page=1&page_size=10');
      expect(result.success).toBe(true);
    });
  });

  describe('Direct API Calls', () => {
    test('should make direct API calls without wrapper', async () => {
      const mockResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await booksAPI.getAllDirect();

      expect(apiClient.get).toHaveBeenCalledWith('/books/');
      expect(result).toEqual(mockResponse);
    });

    test('should make direct create call without wrapper', async () => {
      const bookData = createMockBook();
      const mockResponse = mockApiResponses.books.create.success;
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await booksAPI.createDirect(bookData);

      expect(apiClient.post).toHaveBeenCalledWith('/books/', bookData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      const networkError = createNetworkError();
      apiClient.get.mockRejectedValue(networkError);

      const result = await booksAPI.getAll();

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('network');
    });

    test('should handle server errors', async () => {
      const serverError = createServerError(500);
      apiClient.get.mockRejectedValue(serverError);

      const result = await booksAPI.getById(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('server');
    });

    test('should handle unauthorized access', async () => {
      const unauthorizedError = createServerError(401, 'Unauthorized');
      apiClient.post.mockRejectedValue(unauthorizedError);

      const result = await booksAPI.create(createMockBook());

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
    });

    test('should handle forbidden access', async () => {
      const forbiddenError = createServerError(403, 'Forbidden');
      apiClient.delete.mockRejectedValue(forbiddenError);

      const result = await booksAPI.delete(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authorization');
    });
  });
});