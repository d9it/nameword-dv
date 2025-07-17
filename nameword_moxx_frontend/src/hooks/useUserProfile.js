import { useState, useEffect } from 'react';
import { userProfileApi } from '../api';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get user profile
  const getProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userProfileApi.getProfile();
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userProfileApi.updateProfile(profileData);
      setProfile(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userProfileApi.changePassword(passwordData);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get user activity
  const getActivity = async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userProfileApi.getActivity(page, limit);
      setActivity(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load activity');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get notification preferences
  const getNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userProfileApi.getNotifications();
      setNotifications(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update notification preferences
  const updateNotifications = async (notificationSettings) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userProfileApi.updateNotifications(notificationSettings);
      setNotifications(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    getProfile();
  }, []);

  return {
    profile,
    activity,
    notifications,
    loading,
    error,
    getProfile,
    updateProfile,
    changePassword,
    getActivity,
    getNotifications,
    updateNotifications
  };
}; 