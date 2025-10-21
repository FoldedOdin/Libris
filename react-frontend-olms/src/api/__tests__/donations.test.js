// Donations API integration tests
import { donationsAPI } from '../donations';
import apiClient from '../index';
import { 
  mockApiResponses, 
  setupMockLocalStorage,
  createServerError
} from '../../utils/testUtils';

// Mock axios
jest.mock('../index');

describe('Donations API Integration Tests', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    jest.clearAllMocks();
  });

  describe('Donation Management Operations', () => {
    test('should get all donations successfully', async () => {
      const mockResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await donationsAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/donations/');
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(1);
      expect(result.data.results[0].title).toBe('Donated Book');
    });

    test('should create donation successfully', async () => {
      const donationData = {
        title: 'New Donation',
        author: 'New Author',
        category: 'Science',
        condition: 'Excellent'
      };
      const mockResponse = mockApiResponses.donations.create.success;
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await donationsAPI.create(donationData);

      expect(apiClient.post).toHaveBeenCalledWith('/donate/', donationData);
      expect(result.success).toBe(true);
      expect(result.data.title).toBe('New Donation');
      expect(result.data.status).toBe('pending');
    });

    test('should get donation by ID successfully', async () => {
      const mockDonation = mockApiResponses.donations.getAll.success.data.results[0];
      apiClient.get.mockResolvedValue({ data: mockDonation });

      const result = await donationsAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/donations/1/');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    test('should update donation successfully', async () => {
      const updateData = { condition: 'Fair', notes: 'Minor wear' };
      const updatedDonation = { ...mockApiResponses.donations.getAll.success.data.results[0], ...updateData };
      apiClient.put.mockResolvedValue({ data: updatedDonation });

      const result = await donationsAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/donations/1/', updateData);
      expect(result.success).toBe(true);
      expect(result.data.condition).toBe('Fair');
    });

    test('should delete donation successfully', async () => {
      apiClient.delete.mockResolvedValue({ data: { message: 'Donation deleted successfully' } });

      const result = await donationsAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/donations/1/');
      expect(result.success).toBe(true);
    });
  });

  describe('Admin Operations', () => {
    test('should approve donation successfully', async () => {
      const mockResponse = { data: { message: 'Donation approved successfully', status: 'approved' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await donationsAPI.approve(1);

      expect(apiClient.post).toHaveBeenCalledWith('/dashboard/donations/approve/1/');
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('approved');
    });

    test('should reject donation successfully', async () => {
      const rejectData = { reason: 'Poor condition' };
      const mockResponse = { data: { message: 'Donation rejected', status: 'rejected' } };
      apiClient.post.mockResolvedValue(mockResponse);

      const result = await donationsAPI.reject(1, rejectData);

      expect(apiClient.post).toHaveBeenCalledWith('/dashboard/donations/reject/1/', rejectData);
      expect(result.success).toBe(true);
      expect(result.data.status).toBe('rejected');
    });

    test('should handle unauthorized access for admin operations', async () => {
      const unauthorizedError = createServerError(401, 'Unauthorized');
      apiClient.post.mockRejectedValue(unauthorizedError);

      const result = await donationsAPI.approve(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
    });

    test('should handle forbidden access for non-admin users', async () => {
      const forbiddenError = createServerError(403, 'Forbidden');
      apiClient.post.mockRejectedValue(forbiddenError);

      const result = await donationsAPI.reject(1);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authorization');
    });
  });

  describe('User-specific Operations', () => {
    test('should get user donations successfully', async () => {
      const mockResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await donationsAPI.getUserDonations();

      expect(apiClient.get).toHaveBeenCalledWith('/donations/my/');
      expect(result.success).toBe(true);
    });

    test('should get pending donations successfully', async () => {
      const mockResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await donationsAPI.getPending();

      expect(apiClient.get).toHaveBeenCalledWith('/donations/?status=pending');
      expect(result.success).toBe(true);
    });

    test('should get approved donations successfully', async () => {
      const mockResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await donationsAPI.getApproved();

      expect(apiClient.get).toHaveBeenCalledWith('/donations/?status=approved');
      expect(result.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle validation errors during creation', async () => {
      const invalidData = { title: '' }; // Missing required fields
      const validationError = createServerError(400, 'Validation failed');
      apiClient.post.mockRejectedValue(validationError);

      const result = await donationsAPI.create(invalidData);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('validation');
    });

    test('should handle not found errors', async () => {
      const notFoundError = createServerError(404, 'Donation not found');
      apiClient.get.mockRejectedValue(notFoundError);

      const result = await donationsAPI.getById(999);

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('not_found');
    });
  });

  describe('Direct API Calls', () => {
    test('should make direct API calls without wrapper', async () => {
      const mockResponse = mockApiResponses.donations.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await donationsAPI.getAllDirect();

      expect(apiClient.get).toHaveBeenCalledWith('/donations/');
      expect(result).toEqual(mockResponse);
    });
  });
});