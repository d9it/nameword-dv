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
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData.data);
      } catch (error) {
        console.error('Failed to get current user:', error);
        // Clear any stored tokens on error
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.data) {
        setUser(response.data);
        // Store user data in session storage for persistence
        sessionStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.data) {
        setUser(response.data);
        // Store user data in session storage for persistence
        sessionStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      // Clear stored data
      sessionStorage.removeItem('user');
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
    }
  };

  // Reset password function
  const resetPassword = async (resetData) => {
    try {
      setError(null);
      const response = await authAPI.resetPassword(resetData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Send email verification code
  const sendEmailCode = async (email) => {
    try {
      setError(null);
      const response = await authAPI.sendEmailCode(email);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send verification code';
      setError(errorMessage);
      throw error;
    }
  };

  // Verify email code
  const verifyEmailCode = async (verificationData) => {
    try {
      setError(null);
      const response = await authAPI.verifyEmailCode(verificationData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Email verification failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Send mobile OTP
  const sendMobileOtp = async (mobileData) => {
    try {
      setError(null);
      const response = await authAPI.sendMobileOtp(mobileData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      setError(errorMessage);
      throw error;
    }
  };

  // Verify mobile OTP
  const verifyMobileOtp = async (otpData) => {
    try {
      setError(null);
      const response = await authAPI.verifyMobileOtp(otpData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setError(null);
      const response = await authAPI.changePassword(passwordData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Update user details
  const updateUserDetails = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.updateUserDetails(userData);
      
      // Update local user state if successful
      if (response.data) {
        setUser(response.data);
        sessionStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update user details';
      setError(errorMessage);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    sendEmailCode,
    verifyEmailCode,
    sendMobileOtp,
    verifyMobileOtp,
    changePassword,
    updateUserDetails,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 