// Test utilities for API integration testing

// Mock API responses
export const mockApiResponses = {
  auth: {
    login: {
      success: {
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            role: 'user',
            is_staff: false
          }
        }
      },
      adminSuccess: {
        data: {
          token: 'mock-admin-jwt-token',
          user: {
            id: 2,
            username: 'admin',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin',
            is_staff: true
          }
        }
      },
      error: {
        response: {
          status: 401,
          data: { error: 'Invalid credentials' }
        }
      }
    },
    register: {
      success: {
        data: {
          token: 'mock-jwt-token',
          user: {
            id: 3,
            username: 'newuser',
            email: 'new@example.com',
            first_name: 'New',
            last_name: 'User',
            role: 'user',
            is_staff: false
          }
        }
      },
      error: {
        response: {
          status: 400,
          data: { errors: { username: ['Username already exists'] } }
        }
      }
    }
  },
  books: {
    getAll: {
      success: {
        data: {
          results: [
            {
              id: 1,
              title: 'Test Book 1',
              author: 'Test Author 1',
              isbn: '1234567890',
              category: 'Fiction',
              stock: 5,
              description: 'A test book',
              price: 19.99,
              is_available: true
            },
            {
              id: 2,
              title: 'Test Book 2',
              author: 'Test Author 2',
              isbn: '0987654321',
              category: 'Non-Fiction',
              stock: 3,
              description: 'Another test book',
              price: 24.99,
              is_available: true
            }
          ],
          count: 2,
          next: null,
          previous: null
        }
      }
    },
    getById: {
      success: {
        data: {
          id: 1,
          title: 'Test Book 1',
          author: 'Test Author 1',
          isbn: '1234567890',
          category: 'Fiction',
          stock: 5,
          description: 'A test book',
          price: 19.99,
          is_available: true
        }
      },
      notFound: {
        response: {
          status: 404,
          data: { error: 'Book not found' }
        }
      }
    },
    create: {
      success: {
        data: {
          id: 3,
          title: 'New Book',
          author: 'New Author',
          isbn: '1111111111',
          category: 'Science',
          stock: 1,
          description: 'A new book',
          price: 29.99,
          is_available: true
        }
      },
      error: {
        response: {
          status: 400,
          data: { errors: { title: ['This field is required'] } }
        }
      }
    },
    borrow: {
      success: {
        data: {
          message: 'Book borrowed successfully',
          transaction_id: 1,
          due_date: '2024-01-15'
        }
      },
      unavailable: {
        response: {
          status: 400,
          data: { error: 'Book is not available for borrowing' }
        }
      }
    }
  },
  users: {
    getAll: {
      success: {
        data: {
          results: [
            {
              id: 1,
              username: 'user1',
              email: 'user1@example.com',
              first_name: 'User',
              last_name: 'One',
              role: 'user',
              is_staff: false,
              date_joined: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              username: 'admin',
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User',
              role: 'admin',
              is_staff: true,
              date_joined: '2024-01-01T00:00:00Z'
            }
          ]
        }
      }
    }
  },
  donations: {
    getAll: {
      success: {
        data: {
          results: [
            {
              id: 1,
              user: 1,
              title: 'Donated Book',
              author: 'Donor Author',
              category: 'Fiction',
              condition: 'Good',
              status: 'pending',
              created_at: '2024-01-01T00:00:00Z'
            }
          ]
        }
      }
    },
    create: {
      success: {
        data: {
          id: 2,
          user: 1,
          title: 'New Donation',
          author: 'New Author',
          category: 'Science',
          condition: 'Excellent',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z'
        }
      }
    }
  },
  sales: {
    getAll: {
      success: {
        data: {
          results: [
            {
              id: 1,
              user: 1,
              book: 1,
              price: 15.99,
              status: 'pending',
              created_at: '2024-01-01T00:00:00Z'
            }
          ]
        }
      }
    }
  },
  transactions: {
    getBorrowed: {
      success: {
        data: {
          results: [
            {
              id: 1,
              book: {
                id: 1,
                title: 'Borrowed Book',
                author: 'Book Author'
              },
              user: 1,
              transaction_type: 'borrow',
              date: '2024-01-01T00:00:00Z',
              due_date: '2024-01-15T00:00:00Z',
              fine: 0
            }
          ]
        }
      }
    }
  }
};

// Test wrapper component (simplified for API tests)
export const TestWrapper = null;

// Custom render function with providers (simplified for API tests)
export const renderWithProviders = null;

// Mock localStorage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Setup mock localStorage
export const setupMockLocalStorage = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
};

// Mock axios
export const createMockAxios = () => {
  return {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => createMockAxios()),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
};

// Helper to simulate API delays
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  first_name: 'Test',
  last_name: 'User',
  role: 'user',
  is_staff: false,
  ...overrides
});

// Helper to create mock admin user data
export const createMockAdmin = (overrides = {}) => ({
  id: 2,
  username: 'admin',
  email: 'admin@example.com',
  first_name: 'Admin',
  last_name: 'User',
  role: 'admin',
  is_staff: true,
  ...overrides
});

// Helper to create mock book data
export const createMockBook = (overrides = {}) => ({
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  isbn: '1234567890',
  category: 'Fiction',
  stock: 5,
  description: 'A test book',
  price: 19.99,
  is_available: true,
  ...overrides
});

// Helper to setup authenticated user in localStorage
export const setupAuthenticatedUser = (user = null, token = 'mock-token') => {
  const userData = user || createMockUser();
  mockLocalStorage.getItem.mockImplementation((key) => {
    if (key === 'authToken') return token;
    if (key === 'user') return JSON.stringify(userData);
    return null;
  });
};

// Helper to setup admin user in localStorage
export const setupAuthenticatedAdmin = (admin = null, token = 'mock-admin-token') => {
  const adminData = admin || createMockAdmin();
  mockLocalStorage.getItem.mockImplementation((key) => {
    if (key === 'authToken') return token;
    if (key === 'user') return JSON.stringify(adminData);
    return null;
  });
};

// Helper to clear authentication
export const clearAuthentication = () => {
  mockLocalStorage.getItem.mockReturnValue(null);
};

// Helper to simulate network errors
export const createNetworkError = () => ({
  request: {},
  message: 'Network Error'
});

// Helper to simulate timeout errors
export const createTimeoutError = () => ({
  code: 'ECONNABORTED',
  message: 'timeout of 10000ms exceeded'
});

// Helper to simulate server errors
export const createServerError = (status = 500, message = 'Internal Server Error') => ({
  response: {
    status,
    data: { error: message }
  }
});

export default {
  mockApiResponses,
  mockLocalStorage,
  setupMockLocalStorage,
  createMockAxios,
  delay,
  createMockUser,
  createMockAdmin,
  createMockBook,
  setupAuthenticatedUser,
  setupAuthenticatedAdmin,
  clearAuthentication,
  createNetworkError,
  createTimeoutError,
  createServerError
};