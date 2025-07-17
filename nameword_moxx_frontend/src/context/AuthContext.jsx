import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData.data);
        } catch (error) {
          console.error('Failed to get current user:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setError(null);
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 