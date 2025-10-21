// Authentication API integration tests
import { authAPI, tokenManager, userManager, authHelpers } from '../auth';
import apiClient from '../index';
import { 
  mockApiResponses, 
  setupMockLocalStorage, 
  mockLocalStorage,
  createNetworkError,
  createServerError
} from '../../utils/testUtils';

// Mock axios
jest.mock('../index');

describe('Authentication API Integration Tests', () => {
  beforeEach(() => {
    setupMockLocalStorage();
    jest.clearAllMocks();
  });

  describe('Token Manager', () => {
    test('should manage tokens correctly', () => {
      const testToken = 'test-jwt-token';
      
      // Test setting token
      tokenManager.setToken(testToken);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', testToken);
      
      // Test getting token
      mockLocalStorage.getItem.mockReturnValue(testToken);
      expect(tokenManager.getToken()).toBe(testToken);
      
      // Test removing token
      tokenManager.removeToken();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    });

    test('should validate token correctly', () => {
      // Mock valid JWT token (simplified)
      const validToken = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.signature';
      mockLocalStorage.getItem.mockReturnValue(validToken);
      
      expect(tokenManager.isTokenValid()).toBe(true);
      
      // Test expired token
      const expiredToken = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 - 3600 })) + '.signature';
      mockLocalStorage.getItem.mockReturnValue(expiredToken);
      
      expect(tokenManager.isTokenValid()).toBe(false);
      
      // Test no token
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(tokenManager.isTokenValid()).toBe(false);
    });
  });

  describe('User Manager', () => {
    test('should manage user data correctly', () => {
      const testUser = { id: 1, username: 'testuser', role: 'user' };
      
      // Test setting user
      userManager.setUser(testUser);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(testUser));
      
      // Test getting user
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testUser));
      expect(userManager.getUser()).toEqual(testUser);
      
      // Test removing user
      userManager.removeUser();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('should check admin status correctly', () => {
      // Test admin user
      const adminUser = { id: 1, username: 'admin', role: 'admin', is_staff: true };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(adminUser));
      expect(userManager.isAdmin()).toBe(true);
      
      // Test regular user
      const regularUser = { id: 2, username: 'user', role: 'user', is_staff: false };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(regularUser));
      expect(userManager.isAdmin()).toBe(false);
      
      // Test no user
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(userManager.isAdmin()).toBe(false);
    });

    test('should check authentication status correctly', () => {
      // Mock valid token and user
      const validToken = 'header.' + btoa(JSON.stringify({ exp: Date.now() / 1000 + 3600 })) + '.signature';
      const testUser = { id: 1, username: 'testuser' };
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'authToken') return validToken;
        if (key === 'user') return JSON.stringify(testUser);
        return null;
      });
      
      expect(userManager.isAuthenticated()).toBe(true);
      
      // Test no token
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(userManager.isAuthenticated()).toBe(false);
    });
  });

  describe('Authentication Helpers', () => {
    test('should handle login successfully', async () => {
      const credentials = { username: 'testuser', password: 'password' };
      const mockResponse = mockApiResponses.auth.login.success;
      
      apiClient.post.mockResolvedValue(mockResponse);
      
      const result = await authHelpers.login(credentials);
      
      expect(apiClient.post).toHaveBeenCalledWith('/login/', credentials);
      expect(result.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockResponse.data.token);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.user));
    });

    test('should handle login failure', async () => {
      const credentials = { username: 'testuser', password: 'wrongpassword' };
      const mockError = mockApiResponses.auth.login.error;
      
      apiClient.post.mockRejectedValue(mockError);
      
      const result = await authHelpers.login(credentials);
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('authentication');
    });

    test('should handle registration successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
        first_name: 'New',
        last_name: 'User'
      };
      const mockResponse = mockApiResponses.auth.register.success;
      
      apiClient.post.mockResolvedValue(mockResponse);
      
      const result = await authHelpers.register(userData);
      
      expect(apiClient.post).toHaveBeenCalledWith('/register/', userData);
      expect(result.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockResponse.data.token);
    });

    test('should handle registration failure', async () => {
      const userData = { username: 'existinguser' };
      const mockError = mockApiResponses.auth.register.error;
      
      apiClient.post.mockRejectedValue(mockError);
      
      const result = await authHelpers.register(userData);
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('validation');
    });

    test('should handle logout', async () => {
      apiClient.post.mockResolvedValue({ data: { message: 'Logged out successfully' } });
      
      const result = await authHelpers.logout();
      
      expect(apiClient.post).toHaveBeenCalledWith('/logout/');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('should handle network errors during login', async () => {
      const credentials = { username: 'testuser', password: 'password' };
      const networkError = createNetworkError();
      
      apiClient.post.mockRejectedValue(networkError);
      
      const result = await authHelpers.login(credentials);
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('network');
    });

    test('should handle server errors during registration', async () => {
      const userData = { username: 'newuser' };
      const serverError = createServerError(500);
      
      apiClient.post.mockRejectedValue(serverError);
      
      const result = await authHelpers.register(userData);
      
      expect(result.success).toBe(false);
      expect(result.error.type).toBe('server');
    });
  });

  describe('Authentication API', () => {
    test('should provide all required API methods', () => {
      expect(typeof authAPI.login).toBe('function');
      expect(typeof authAPI.register).toBe('function');
      expect(typeof authAPI.logout).toBe('function');
      expect(typeof authAPI.refreshToken).toBe('function');
      expect(typeof authAPI.getCurrentUser).toBe('function');
      expect(typeof authAPI.loginDirect).toBe('function');
      expect(typeof authAPI.registerDirect).toBe('function');
      expect(typeof authAPI.logoutDirect).toBe('function');
    });

    test('should handle getCurrentUser successfully', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      apiClient.get.mockResolvedValue({ data: mockUser });
      
      const result = await authAPI.getCurrentUser();
      
      expect(apiClient.get).toHaveBeenCalledWith('/user/profile/');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    test('should handle refreshToken successfully', async () => {
      const newToken = 'new-jwt-token';
      apiClient.post.mockResolvedValue({ data: { token: newToken } });
      
      const result = await authAPI.refreshToken();
      
      expect(apiClient.post).toHaveBeenCalledWith('/refresh-token/');
      expect(result.success).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', newToken);
    });

    test('should handle direct API calls without state management', async () => {
      const credentials = { username: 'testuser', password: 'password' };
      const mockResponse = { data: { token: 'token', user: {} } };
      
      apiClient.post.mockResolvedValue(mockResponse);
      
      const result = await authAPI.loginDirect(credentials);
      
      expect(apiClient.post).toHaveBeenCalledWith('/login/', credentials);
      expect(result).toEqual(mockResponse);
      // Should not set localStorage for direct calls
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Role-based Access Control', () => {
    test('should correctly identify admin users', () => {
      const adminUser = { id: 1, username: 'admin', role: 'admin', is_staff: true };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(adminUser));
      
      expect(userManager.isAdmin()).toBe(true);
    });

    test('should correctly identify regular users', () => {
      const regularUser = { id: 2, username: 'user', role: 'user', is_staff: false };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(regularUser));
      
      expect(userManager.isAdmin()).toBe(false);
    });

    test('should handle missing user data', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      
      expect(userManager.isAdmin()).toBe(false);
      expect(userManager.isAuthenticated()).toBe(false);
    });
  });
});