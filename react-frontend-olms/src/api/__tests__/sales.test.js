// Sales API integration tests
import { salesAPI } from '../sales';
import apiClient from '../index';
import { 
  mockApiResponses, 
  setupMockLocalStorage,
  createServerError
} from '../../utils/testUtils';

// Mock axios
jest.mock('../index');

describe('Sales API Integration Tests', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    jest.clearAllMocks();
  });

  describe('Sales Management Operations', () => {
    test('should get all sales successfully', async () => {
      const mockResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await salesAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/sales/');
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].price).toBe(15.99);
    });

    test('should create sale successfully', async () => {
      const saleData = {
        book: 1,
        price: 25.99,
        condition: 'Good',
        notes: 'Well maintained'
      };
      const mockResponse = { 
        data: { 
          id: 2, 
          ...saleData, 
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z'
        } 
      };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await salesAPI.create(saleData);

      expect(apiClient.post).toHaveBeenCalledWith('/sell/', saleData);
      expect(result.success).toBe(true);
      expect(result.data.price).toBe(25.99);
      expect(result.data.status).toBe('pending');
    });

    test('should get sale by ID successfully', async () => {
      const mockSale = mockApiResponses.sales.getAll.success.data.results[0];
      apiClient.get.mockResolvedValue({ data: mockSale });

      const result = await salesAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/sales/1/');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    test('should update sale successfully', async () => {
      const updateData = { price: 20.99, notes: 'Price reduced' };
      const updatedSale = { ...mockApiResponses.sales.getAll.success.data.results[0], ...updateData };
      apiClient.put.mockResolvedValue({ data: updatedSale });

      const result = await salesAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/sales/1/', updateData);
      expect(result.success).toBe(true);
      expect(result.data.price).toBe(20.99);
    });

    test('should delete sale successfully', async () => {
      apiClient.delete.mockResolvedValue({ data: { message: 'Sale deleted successfully' } });

      const result = await salesAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/sales/1/');
      expect(result.success).toBe(true);
    });
  });

  describe('Admin Operations', () => {
    test('should approve sale successfully', async () => {
      const mockResponse = { data: { message: 'Sale approved successfully', status: 'approved' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await salesAPI.approve(1);

      expect(apiClient.post).toHaveBeenCalledWith('/sales/approve/1/');
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('approved');
    });

    test('should reject sale successfully', async () => {
      const rejectData = { reason: 'Overpriced' };
      const mockResponse = { data: { message: 'Sale rejected', status: 'rejected' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await salesAPI.reject(1, rejectData);

      expect(apiClient.post).toHaveBeenCalledWith('/sales/reject/1/', rejectData);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('rejected');
    });

    test('should handle unauthorized access for admin operations', async () => {
      const unauthorizedError = createServerError(401, 'Unauthorized');
      apiClient.post.mockRejectedValue(unauthorizedError);

      const result = await salesAPI.approve(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
    });

    test('should handle forbidden access for non-admin users', async () => {
      const forbiddenError = createServerError(403, 'Forbidden');
      apiClient.post.mockRejectedValue(forbiddenError);

      const result = await salesAPI.reject(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authorization');
    });
  });

  describe('User-specific Operations', () => {
    test('should get user sales successfully', async () => {
      const mockResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await salesAPI.getUserSales();

      expect(apiClient.get).toHaveBeenCalledWith('/sales/my/');
      expect(result.success).toBe(true);
    });

    test('should get pending sales successfully', async () => {
      const mockResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await salesAPI.getPending();

      expect(apiClient.get).toHaveBeenCalledWith('/sales/?status=pending');
      expect(result.success).toBe(true);
    });

    test('should get approved sales successfully', async () => {
      const mockResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await salesAPI.getApproved();

      expect(apiClient.get).toHaveBeenCalledWith('/sales/?status=approved');
      expect(result.success).toBe(true);
    });

    test('should get sold items successfully', async () => {
      const mockResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await salesAPI.getSold();

      expect(apiClient.get).toHaveBeenCalledWith('/sales/?status=sold');
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors during creation', async () => {
      const invalidData = { price: -10 }; // Invalid price
      const validationError = createServerError(400, 'Validation failed');
      apiClient.post.mockRejectedValue(validationError);

      const result = await salesAPI.create(invalidData);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('validation');
    });

    test('should handle not found errors', async () => {
      const notFoundError = createServerError(404, 'Sale not found');
      apiClient.get.mockRejectedValue(notFoundError);

      const result = await salesAPI.getById(999);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('not_found');
    });

    test('should handle conflict errors when approving already processed sale', async () => {
      const conflictError = createServerError(409, 'Sale already processed');
      apiClient.post.mockRejectedValue(conflictError);

      const result = await salesAPI.approve(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('conflict');
    });
  });

  describe('Direct API Calls', () => {
    test('should make direct API calls without wrapper', async () => {
      const mockResponse = mockApiResponses.sales.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await salesAPI.getAllDirect();

      expect(apiClient.get).toHaveBeenCalledWith('/sales/');
      expect(result).toEqual(mockResponse);
    });
  });
});