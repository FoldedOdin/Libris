import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userManager, tokenManager } from '../api/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        if (userManager.isAuthenticated()) {
          const userData = userManager.getUser();
          setUser(userData);
          setIsAuthenticated(true);
          
          // Only fetch fresh user data if we have a valid session
          // Skip this for now to avoid authentication errors on startup
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid auth state
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authAPI.login(credentials);
      
      if (result.success) {
        const userData = userManager.getUser();
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const result = await authAPI.register(userData);
      
      if (result.success) {
        const newUser = userManager.getUser();
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Registration failed',
          data: result.data // Include validation errors
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'An unexpected error occurred during registration' 
      };
    }
  };

  const logout = async () => {
    try {
      // Call logout API (optional, as we clear local state regardless)
      await authAPI.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (updatedUserData) => {
    userManager.setUser(updatedUserData);
    setUser(updatedUserData);
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.is_staff === true;
  };

  const hasRole = (role) => {
    if (role === 'admin') {
      return isAdmin();
    }
    return user?.role === role;
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    
    // Utilities
    isAdmin,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;