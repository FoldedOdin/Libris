// Users API integration tests
import { usersAPI } from '../users';
import apiClient from '../index';
import { 
  mockApiResponses, 
  setupMockLocalStorage,
  createServerError,
  createMockUser
} from '../../utils/testUtils';

// Mock axios
jest.mock('../index');

describe('Users API Integration Tests', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    jest.clearAllMocks();
  });

  describe('User Management Operations', () => {
    test('should get all users successfully', async () => {
      const mockResponse = mockApiResponses.users.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await usersAPI.getAll();

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/users/');
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(2);
    });

    test('should get user by ID successfully', async () => {
      const mockUser = createMockUser();
      apiClient.get.mockResolvedValue({ data: mockUser });

      const result = await usersAPI.getById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/users/1/');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
    });

    test('should update user successfully', async () => {
      const updateData = { first_name: 'Updated', last_name: 'Name' };
      const updatedUser = { ...createMockUser(), ...updateData };
      apiClient.put.mockResolvedValue({ data: updatedUser });

      const result = await usersAPI.update(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/dashboard/users/1/', updateData);
      expect(result.success).toBe(true);
      expect(result.data.first_name).toBe('Updated');
    });

    test('should delete user successfully', async () => {
      apiClient.delete.mockResolvedValue({ data: { message: 'User deleted successfully' } });

      const result = await usersAPI.delete(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/dashboard/users/1/');
      expect(result.success).toBe(true);
    });

    test('should handle unauthorized access', async () => {
      const unauthorizedError = createServerError(401, 'Unauthorized');
      apiClient.get.mockRejectedValue(unauthorizedError);

      const result = await usersAPI.getAll();

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
    });

    test('should handle forbidden access for non-admin users', async () => {
      const forbiddenError = createServerError(403, 'Forbidden');
      apiClient.get.mockRejectedValue(forbiddenError);

      const result = await usersAPI.getAll();

      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authorization');
    });
  });

  describe('Direct API Calls', () => {
    test('should make direct API calls without wrapper', async () => {
      const mockResponse = mockApiResponses.users.getAll.success;
      apiClient.get.mockResolvedValue(mockResponse);

      const result = await usersAPI.getAllDirect();

      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/users/');
      expect(result).toEqual(mockResponse);
    });
  });
});