// Comprehensive API integration tests
import { authAPI } from '../auth';
import { booksAPI } from '../books';
import { usersAPI } from '../users';
import { donationsAPI } from '../donations';
import { salesAPI } from '../sales';
import { transactionsAPI } from '../transactions';
import apiClient from '../index';
import { 
  mockApiResponses, 
  setupMockLocalStorage,
  setupAuthenticatedUser,
  setupAuthenticatedAdmin,
  clearAuthentication,
  createMockUser,
  createMockAdmin,
  createMockBook
} from '../../utils/testUtils';

// Mock axios
jest.mock('../index');

describe('API Integration Flow Tests', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    jest.clearAllMocks();
  });

  describe('Complete User Authentication Flow', () => {
    test('should complete full login to logout flow', async () => {
      // Step 1: Login
      const credentials = { username: 'testuser', password: 'password' };
      const loginResponse = mockApiResponses.auth.login.success;
      apiClient.post.mockResolvedValue(loginResponse);

      const loginResult = await authAPI.login(credentials);
      expect(loginResult.success).toBe(true);

      // Step 2: Get current user
      const userResponse = { data: loginResponse.data.user };
      apiClient.get.mockResolvedValue(userResponse);

      const userResult = await authAPI.getCurrentUser();
      expect(userResult.success).toBe(true);
      expect(userResult.data.username).toBe('testuser');

      // Step 3: Logout
      apiClient.post.mockResolvedValue({ data: { message: 'Logged out' } });

      const logoutResult = await authAPI.logout();
      expect(logoutResult.success).toBe(true);
    });

    test('should complete full registration to first login flow', async () => {
      // Step 1: Register
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
        first_name: 'New',
        last_name: 'User'
      };
      const registerResponse = mockApiResponses.auth.register.success;
      apiClient.post.mockResolvedValue(registerResponse);

      const registerResult = await authAPI.register(userData);
      expect(registerResult.success).toBe(true);

      // Step 2: Get user profile after registration
      const profileResponse = { data: registerResponse.data.user };
      apiClient.get.mockResolvedValue(profileResponse);

      const profileResult = await authAPI.getCurrentUser();
      expect(profileResult.success).toBe(true);
      expect(profileResult.data.username).toBe('newuser');
    });
  });

  describe('Complete Book Management Flow', () => {
    beforeEach(() => {
      setupAuthenticatedAdmin();
    });

    test('should complete full book lifecycle (create, read, update, delete)', async () => {
      // Step 1: Create book
      const bookData = createMockBook({ title: 'New Book', author: 'New Author' });
      const createResponse = { data: { id: 1, ...bookData } };
      apiClient.post.mockResolvedValue(createResponse);

      const createResult = await booksAPI.create(bookData);
      expect(createResult.success).toBe(true);
      expect(createResult.data.title).toBe('New Book');

      // Step 2: Read book
      apiClient.get.mockResolvedValue(createResponse);

      const readResult = await booksAPI.getById(1);
      expect(readResult.success).toBe(true);
      expect(readResult.data.id).toBe(1);

      // Step 3: Update book
      const updateData = { title: 'Updated Book Title' };
      const updateResponse = { data: { ...createResponse.data, ...updateData } };
      apiClient.put.mockResolvedValue(updateResponse);

      const updateResult = await booksAPI.update(1, updateData);
      expect(updateResult.success).toBe(true);
      expect(updateResult.data.title).toBe('Updated Book Title');

      // Step 4: Delete book
      apiClient.delete.mockResolvedValue({ data: { message: 'Book deleted' } });

      const deleteResult = await booksAPI.delete(1);
      expect(deleteResult.success).toBe(true);
    });

    test('should complete book borrowing and returning flow', async () => {
      setupAuthenticatedUser();

      // Step 1: Get available books
      const booksResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(booksResponse);

      const booksResult = await booksAPI.getAvailableBooks();
      expect(booksResult.success).toBe(true);
      expect(booksResult.data.results).toHaveLength(2);

      // Step 2: Borrow a book
      const borrowResponse = mockApiResponses.books.borrow.success;
      apiClient.post.mockResolvedValue(borrowResponse);

      const borrowResult = await booksAPI.borrow(1);
      expect(borrowResult.success).toBe(true);
      expect(borrowResult.data.transaction_id).toBe(1);

      // Step 3: Check borrowed books
      const borrowedResponse = mockApiResponses.transactions.getBorrowed.success;
      apiClient.get.mockResolvedValue(borrowedResponse);

      const borrowedResult = await transactionsAPI.getBorrowed();
      expect(borrowedResult.success).toBe(true);
      expect(borrowedResult.data.results).toHaveLength(1);

      // Step 4: Return the book
      const returnResponse = { data: { message: 'Book returned successfully' } };
      apiClient.post.mockResolvedValue(returnResponse);

      const returnResult = await booksAPI.return(1);
      expect(returnResult.success).toBe(true);
    });
  });

  describe('Complete Donation Management Flow', () => {
    beforeEach(() => {
      setupAuthenticatedUser();
    });

    test('should complete donation submission and approval flow', async () => {
      // Step 1: User submits donation
      const donationData = {
        title: 'Donated Book',
        author: 'Donor Author',
        category: 'Fiction',
        condition: 'Good'
      };
      const createResponse = mockApiResponses.donations.create.success;
      apiClient.post.mockResolvedValue(createResponse);

      const createResult = await donationsAPI.create(donationData);
      expect(createResult.success).toBe(true);
      expect(createResult.data.status).toBe('pending');

      // Step 2: Admin views pending donations
      setupAuthenticatedAdmin();
      const pendingResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(pendingResponse);

      const pendingResult = await donationsAPI.getPending();
      expect(pendingResult.success).toBe(true);

      // Step 3: Admin approves donation
      const approveResponse = { data: { message: 'Donation approved', status: 'approved' } };
      apiClient.post.mockResolvedValue(approveResponse);

      const approveResult = await donationsAPI.approve(1);
      expect(approveResult.success).toBe(true);
      expect(approveResult.data.status).toBe('approved');

      // Step 4: User checks donation status
      setupAuthenticatedUser();
      const userDonationsResponse = { 
        data: { 
          results: [{ ...createResponse.data, status: 'approved' }] 
        } 
      };
      apiClient.get.mockResolvedValue(userDonationsResponse);

      const userDonationsResult = await donationsAPI.getUserDonations();
      expect(userDonationsResult.success).toBe(true);
      expect(userDonationsResult.data.results[0].status).toBe('approved');
    });
  });

  describe('Complete Sales Management Flow', () => {
    beforeEach(() => {
      setupAuthenticatedUser();
    });

    test('should complete sales listing and approval flow', async () => {
      // Step 1: User lists book for sale
      const saleData = {
        book: 1,
        price: 25.99,
        condition: 'Good'
      };
      const createResponse = { 
        data: { 
          id: 1, 
          ...saleData, 
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z'
        } 
      };
      apiClient.post.mockResolvedValue(createResponse);

      const createResult = await salesAPI.create(saleData);
      expect(createResult.success).toBe(true);
      expect(createResult.data.status).toBe('pending');

      // Step 2: Admin views pending sales
      setupAuthenticatedAdmin();
      const pendingResponse = { data: { results: [createResponse.data] } };
      apiClient.get.mockResolvedValue(pendingResponse);

      const pendingResult = await salesAPI.getPending();
      expect(pendingResult.success).toBe(true);

      // Step 3: Admin approves sale
      const approveResponse = { data: { message: 'Sale approved', status: 'approved' } };
      apiClient.post.mockResolvedValue(approveResponse);

      const approveResult = await salesAPI.approve(1);
      expect(approveResult.success).toBe(true);
      expect(approveResult.data.status).toBe('approved');

      // Step 4: User checks sale status
      setupAuthenticatedUser();
      const userSalesResponse = { 
        data: { 
          results: [{ ...createResponse.data, status: 'approved' }] 
        } 
      };
      apiClient.get.mockResolvedValue(userSalesResponse);

      const userSalesResult = await salesAPI.getUserSales();
      expect(userSalesResult.success).toBe(true);
      expect(userSalesResult.data.results[0].status).toBe('approved');
    });
  });

  describe('Admin Dashboard Integration Flow', () => {
    beforeEach(() => {
      setupAuthenticatedAdmin();
    });

    test('should complete admin dashboard data loading flow', async () => {
      // Step 1: Get dashboard statistics
      const statsResponse = { 
        data: { 
          total_books: 100,
          total_users: 50,
          pending_donations: 5,
          pending_sales: 3,
          overdue_books: 2
        } 
      };
      apiClient.get.mockResolvedValue(statsResponse);

      const statsResult = await transactionsAPI.getDashboardStats();
      expect(statsResult.success).toBe(true);
      expect(statsResult.data.total_books).toBe(100);

      // Step 2: Get all users
      const usersResponse = mockApiResponses.users.getAll.success;
      apiClient.get.mockResolvedValue(usersResponse);

      const usersResult = await usersAPI.getAll();
      expect(usersResult.success).toBe(true);
      expect(usersResult.data.results).toHaveLength(2);

      // Step 3: Get all books
      const booksResponse = mockApiResponses.books.getAll.success;
      apiClient.get.mockResolvedValue(booksResponse);

      const booksResult = await booksAPI.getAll();
      expect(booksResult.success).toBe(true);
      expect(booksResult.data.results).toHaveLength(2);

      // Step 4: Get pending donations
      const donationsResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(donationsResponse);

      const donationsResult = await donationsAPI.getPending();
      expect(donationsResult.success).toBe(true);

      // Step 5: Get pending sales
      const salesResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(salesResponse);

      const salesResult = await salesAPI.getPending();
      expect(salesResult.success).toBe(true);

      // Step 6: Get overdue books
      const overdueResponse = { 
        data: { 
          results: [
            {
              id: 1,
              book: { id: 1, title: 'Overdue Book' },
              user: 1,
              due_date: '2023-12-01T00:00:00Z',
              fine: 5.00
            }
          ]
        }
      };
      apiClient.get.mockResolvedValue(overdueResponse);

      const overdueResult = await transactionsAPI.getOverdue();
      expect(overdueResult.success).toBe(true);
      expect(overdueResult.data.results[0].fine).toBe(5.00);
    });
  });

  describe('User Dashboard Integration Flow', () => {
    beforeEach(() => {
      setupAuthenticatedUser();
    });

    test('should complete user dashboard data loading flow', async () => {
      // Step 1: Get user statistics
      const statsResponse = { 
        data: { 
          books_borrowed: 5,
          books_returned: 4,
          current_borrowed: 1,
          pending_donations: 2,
          pending_sales: 1
        } 
      };
      apiClient.get.mockResolvedValue(statsResponse);

      const statsResult = await transactionsAPI.getUserStats(1);
      expect(statsResult.success).toBe(true);
      expect(statsResult.data.current_borrowed).toBe(1);

      // Step 2: Get currently borrowed books
      const borrowedResponse = mockApiResponses.transactions.getBorrowed.success;
      apiClient.get.mockResolvedValue(borrowedResponse);

      const borrowedResult = await transactionsAPI.getBorrowed();
      expect(borrowedResult.success).toBe(true);
      expect(borrowedResult.data.results).toHaveLength(1);

      // Step 3: Get user donations
      const donationsResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(donationsResponse);

      const donationsResult = await donationsAPI.getUserDonations();
      expect(donationsResult.success).toBe(true);

      // Step 4: Get user sales
      const salesResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(salesResponse);

      const salesResult = await salesAPI.getUserSales();
      expect(salesResult.success).toBe(true);

      // Step 5: Get transaction history
      const historyResponse = { 
        data: { 
          results: [
            {
              id: 1,
              book: { id: 1, title: 'History Book' },
              transaction_type: 'borrow',
              date: '2024-01-01T00:00:00Z'
            }
          ]
        }
      };
      apiClient.get.mockResolvedValue(historyResponse);

      const historyResult = await transactionsAPI.getHistory();
      expect(historyResult.success).toBe(true);
      expect(historyResult.data.results).toHaveLength(1);
    });
  });

  describe('Role-based Access Control Integration', () => {
    test('should enforce admin-only operations', async () => {
      setupAuthenticatedUser(); // Regular user

      // Admin operations should fail for regular users
      const forbiddenError = { response: { status: 403, data: { error: 'Forbidden' } } };
      
      apiClient.get.mockRejectedValue(forbiddenError);
      const usersResult = await usersAPI.getAll();
      expect(usersResult.success).toBe(false);
      expect(usersResult.error.type).toBe('authorization');

      apiClient.post.mockRejectedValue(forbiddenError);
      const approveResult = await donationsAPI.approve(1);
      expect(approveResult.success).toBe(false);
      expect(approveResult.error.type).toBe('authorization');
    });

    test('should allow admin operations for admin users', async () => {
      setupAuthenticatedAdmin(); // Admin user

      // Admin operations should succeed
      const usersResponse = mockApiResponses.users.getAll.success;
      apiClient.get.mockResolvedValue(usersResponse);

      const usersResult = await usersAPI.getAll();
      expect(usersResult.success).toBe(true);

      const approveResponse = { data: { message: 'Approved', status: 'approved' } };
      apiClient.post.mockResolvedValue(approveResponse);

      const approveResult = await donationsAPI.approve(1);
      expect(approveResult.success).toBe(true);
    });

    test('should handle unauthenticated access', async () => {
      clearAuthentication(); // No authentication

      const unauthorizedError = { response: { status: 401, data: { error: 'Unauthorized' } } };
      apiClient.get.mockRejectedValue(unauthorizedError);

      const result = await booksAPI.getAll();
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
    });
  });

  describe('Error Recovery and Retry Logic', () => {
    test('should handle network errors with retry', async () => {
      setupAuthenticatedUser();

      // First call fails with network error, second succeeds
      const networkError = { request: {}, message: 'Network Error' };
      const successResponse = mockApiResponses.books.getAll.success;

      apiClient.get
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(successResponse);

      const result = await booksAPI.getAll();
      expect(result.success).toBe(true);
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });

    test('should handle server errors appropriately', async () => {
      setupAuthenticatedUser();

      const serverError = { response: { status: 500, data: { error: 'Internal Server Error' } } };
      apiClient.get.mockRejectedValue(serverError);

      const result = await booksAPI.getAll();
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('server');
    });
  });
});