// Transactions API integration tests
import { transactionsAPI } from '../transactions';
import apiClient from '../index';
import { 
  mockApiResponses, 
  setupMockLocalStorage,
  createServerError
} from '../../utils/testUtils';

// Mock axios
jest.mock('../index');

describe('Transactions API Integration Tests', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    jest.clearAllMocks();
  });

  describe('Transaction Management Operations', () => {
    test('should get all transactions successfully', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/');
      expect(result.success).toBe(true);
    });

    test('should get borrowed books successfully', async () => {
      const mockResponse = mockApiResponses.transactions.getBorrowed.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getBorrowed();

      expect(apiClient.get).toHaveBeenCalledWith('/my-borrowed/');
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].transaction_type).toBe('borrow');
    });

    test('should get user borrowed books successfully', async () => {
      const mockResponse = mockApiResponses.transactions.getBorrowed.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getUserBorrowed(1);

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/user/1/borrowed/');
      expect(result.success).toBe(true);
    });

    test('should get transaction history successfully', async () => {
      const mockResponse = { 
        data: { 
          results: [
            {
              id: 1,
              book: { id: 1, title: 'Test Book' },
              user: 1,
              transaction_type: 'borrow',
              date: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              book: { id: 1, title: 'Test Book' },
              user: 1,
              transaction_type: 'return',
              date: '2024-01-10T00:00:00Z'
            }
          ]
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getHistory();

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/history/');
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(2);
    });

    test('should get user transaction history successfully', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getUserHistory(1);

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/user/1/history/');
      expect(result.success).toBe(true);
    });
  });

  describe('Transaction Actions', () => {
    test('should mark book as returned successfully', async () => {
      const returnData = { condition: 'Good', notes: 'No damage' };
      const mockResponse = { 
        data: { 
          message: 'Book returned successfully',
          transaction_id: 1,
          return_date: '2024-01-10T00:00:00Z'
        } 
      };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.markReturned(1, returnData);

      expect(apiClient.post).toHaveBeenCalledWith('/transactions/1/return/', returnData);
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Book returned successfully');
    });

    test('should get transaction by ID successfully', async () => {
      const mockTransaction = mockApiResponses.transactions.getBorrowed.success.data.results[0];
      apiClient.get.mockResolvedValue({ data: mockTransaction });

      const result = await transactionsAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/1/');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    test('should update transaction successfully', async () => {
      const updateData = { notes: 'Updated notes' };
      const updatedTransaction = { 
        ...mockApiResponses.transactions.getBorrowed.success.data.results[0], 
        ...updateData 
      };
      apiClient.put.mockResolvedValue({ data: updatedTransaction });

      const result = await transactionsAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/transactions/1/', updateData);
      expect(result.success).toBe(true);
    });
  });

  describe('Filtering and Search', () => {
    test('should get overdue books successfully', async () => {
      const mockResponse = { 
        data: { 
          results: [
            {
              id: 1,
              book: { id: 1, title: 'Overdue Book' },
              user: 1,
              transaction_type: 'borrow',
              due_date: '2023-12-01T00:00:00Z',
              fine: 5.00
            }
          ]
        }
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getOverdue();

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/overdue/');
      expect(result.success).toBe(true);
      expect(result.data.results[0].fine).toBe(5.00);
    });

    test('should get transactions by book successfully', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getByBook(1);

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/book/1/');
      expect(result.success).toBe(true);
    });

    test('should get transactions by date range successfully', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getByDateRange(startDate, endDate);

      expect(apiClient.get).toHaveBeenCalledWith(`/transactions/?start_date=${startDate}&end_date=${endDate}`);
      expect(result.success).toBe(true);
    });

    test('should get transactions by type successfully', async () => {
      const mockResponse = { data: { results: [] } };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getByType('borrow');

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/?type=borrow');
      expect(result.success).toBe(true);
    });
  });

  describe('Dashboard and Statistics', () => {
    test('should get dashboard statistics successfully', async () => {
      const mockResponse = { 
        data: { 
          total_borrowed: 15,
          total_returned: 12,
          overdue_count: 3,
          total_fines: 25.50
        } 
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getDashboardStats();

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/');
      expect(result.success).toBe(true);
      expect(result.data.total_borrowed).toBe(15);
      expect(result.data.overdue_count).toBe(3);
    });

    test('should get user statistics successfully', async () => {
      const mockResponse = { 
        data: { 
          books_borrowed: 5,
          books_returned: 4,
          current_borrowed: 1,
          total_fines: 0
        } 
      };
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getUserStats(1);

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/user/1/stats/');
      expect(result.success).toBe(true);
      expect(result.data.books_borrowed).toBe(5);
    });
  });

  describe('Error Handling', () => {
    test('should handle unauthorized access', async () => {
      const unauthorizedError = createServerError(401, 'Unauthorized');
      apiClient.get.mockRejectedValue(unauthorizedError);

      const result = await transactionsAPI.getBorrowed();

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
    });

    test('should handle not found errors', async () => {
      const notFoundError = createServerError(404, 'Transaction not found');
      apiClient.get.mockRejectedValue(notFoundError);

      const result = await transactionsAPI.getById(999);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('not_found');
    });

    test('should handle validation errors when marking returned', async () => {
      const validationError = createServerError(400, 'Invalid return data');
      apiClient.post.mockRejectedValue(validationError);

      const result = await transactionsAPI.markReturned(1, {});

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('validation');
    });

    test('should handle forbidden access for admin operations', async () => {
      const forbiddenError = createServerError(403, 'Forbidden');
      apiClient.get.mockRejectedValue(forbiddenError);

      const result = await transactionsAPI.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authorization');
    });
  });

  describe('Direct API Calls', () => {
    test('should make direct API calls without wrapper', async () => {
      const mockResponse = mockApiResponses.transactions.getBorrowed.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await transactionsAPI.getBorrowedDirect();

      expect(apiClient.get).toHaveBeenCalledWith('/my-borrowed/');
      expect(result).toEqual(mockResponse);
    });
  });
});