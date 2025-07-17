import { useState } from 'react';
import { hostingApi } from '../api';

export const useHosting = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // cPanel Hosting
  const cpanel = {
    // Get cPanel plans
    getPlans: async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cpanel.getPlans();
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load cPanel plans');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Create cPanel account
    createAccount: async (accountData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cpanel.createAccount(accountData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to create cPanel account');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get cPanel accounts
    getAccounts: async (page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cpanel.getAccounts(page, limit);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load cPanel accounts');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get cPanel account details
    getAccount: async (accountId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cpanel.getAccount(accountId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load cPanel account');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Update cPanel account
    updateAccount: async (accountId, updateData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cpanel.updateAccount(accountId, updateData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to update cPanel account');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Delete cPanel account
    deleteAccount: async (accountId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cpanel.deleteAccount(accountId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to delete cPanel account');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  // Plesk Hosting
  const plesk = {
    // Get Plesk plans
    getPlans: async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.plesk.getPlans();
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load Plesk plans');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Create Plesk account
    createAccount: async (accountData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.plesk.createAccount(accountData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to create Plesk account');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get Plesk accounts
    getAccounts: async (page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.plesk.getAccounts(page, limit);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load Plesk accounts');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get Plesk account details
    getAccount: async (accountId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.plesk.getAccount(accountId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load Plesk account');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  // Cloudflare Hosting
  const cloudflare = {
    // Get Cloudflare zones
    getZones: async (page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cloudflare.getZones(page, limit);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load Cloudflare zones');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Create Cloudflare zone
    createZone: async (zoneData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cloudflare.createZone(zoneData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to create Cloudflare zone');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get Cloudflare zone details
    getZone: async (zoneId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cloudflare.getZone(zoneId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load Cloudflare zone');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Update Cloudflare zone
    updateZone: async (zoneId, updateData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await hostingApi.cloudflare.updateZone(zoneId, updateData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to update Cloudflare zone');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    cpanel,
    plesk,
    cloudflare,
    loading,
    error
  };
}; 