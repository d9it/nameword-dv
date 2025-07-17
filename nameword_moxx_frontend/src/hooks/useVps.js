import { useState } from 'react';
import { vpsApi } from '../api';

export const useVps = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // VPS Plans
  const plans = {
    // Get VPS plans
    getAll: async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.plans.getAll();
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS plans');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get VPS plan details
    getById: async (planId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.plans.getById(planId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS plan');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  // VPS Instances
  const instances = {
    // Get VPS instances
    getAll: async (page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.getAll(page, limit);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS instances');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get VPS instance details
    getById: async (instanceId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.getById(instanceId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS instance');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Create VPS instance
    create: async (instanceData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.create(instanceData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to create VPS instance');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Update VPS instance
    update: async (instanceId, updateData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.update(instanceId, updateData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to update VPS instance');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Delete VPS instance
    delete: async (instanceId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.delete(instanceId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to delete VPS instance');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Start VPS instance
    start: async (instanceId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.start(instanceId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to start VPS instance');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Stop VPS instance
    stop: async (instanceId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.stop(instanceId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to stop VPS instance');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Restart VPS instance
    restart: async (instanceId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.instances.restart(instanceId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to restart VPS instance');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  // VPS Disks
  const disks = {
    // Get VPS disks
    getAll: async (instanceId, page = 1, limit = 10) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.disks.getAll(instanceId, page, limit);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS disks');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get VPS disk details
    getById: async (instanceId, diskId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.disks.getById(instanceId, diskId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS disk');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Create VPS disk
    create: async (instanceId, diskData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.disks.create(instanceId, diskData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to create VPS disk');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Update VPS disk
    update: async (instanceId, diskId, updateData) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.disks.update(instanceId, diskId, updateData);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to update VPS disk');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Delete VPS disk
    delete: async (instanceId, diskId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.disks.delete(instanceId, diskId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to delete VPS disk');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  // VPS Billing Cycles
  const billingCycles = {
    // Get VPS billing cycle discounts
    getDiscounts: async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.billingCycles.getDiscounts();
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS billing cycle discounts');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get VPS billing cycle discount by ID
    getDiscountById: async (discountId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.billingCycles.getDiscountById(discountId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load VPS billing cycle discount');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  // Operating Systems
  const operatingSystems = {
    // Get operating systems
    getAll: async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.operatingSystems.getAll();
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load operating systems');
        throw err;
      } finally {
        setLoading(false);
      }
    },

    // Get operating system details
    getById: async (osId) => {
      setLoading(true);
      setError(null);
      try {
        const data = await vpsApi.operatingSystems.getById(osId);
        return data;
      } catch (err) {
        setError(err.message || 'Failed to load operating system');
        throw err;
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    plans,
    instances,
    disks,
    billingCycles,
    operatingSystems,
    loading,
    error
  };
}; 