import apiClient from './apiClient';

// Compute Engine API
export const computeEngineApi = {
  // Instances
  instances: {
    // Get Compute Engine instances
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/compute-engine/instances?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get Compute Engine instance details
    getById: async (instanceId) => {
      try {
        const response = await apiClient.get(`/api/compute-engine/instances/${instanceId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create Compute Engine instance
    create: async (instanceData) => {
      try {
        const response = await apiClient.post('/api/compute-engine/instances', instanceData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update Compute Engine instance
    update: async (instanceId, updateData) => {
      try {
        const response = await apiClient.put(`/api/compute-engine/instances/${instanceId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete Compute Engine instance
    delete: async (instanceId) => {
      try {
        const response = await apiClient.delete(`/api/compute-engine/instances/${instanceId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Start Compute Engine instance
    start: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/compute-engine/instances/${instanceId}/start`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Stop Compute Engine instance
    stop: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/compute-engine/instances/${instanceId}/stop`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Restart Compute Engine instance
    restart: async (instanceId) => {
      try {
        const response = await apiClient.post(`/api/compute-engine/instances/${instanceId}/restart`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Disks
  disks: {
    // Get Compute Engine disks
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/compute-engine/disks?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get Compute Engine disk details
    getById: async (diskId) => {
      try {
        const response = await apiClient.get(`/api/compute-engine/disks/${diskId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create Compute Engine disk
    create: async (diskData) => {
      try {
        const response = await apiClient.post('/api/compute-engine/disks', diskData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update Compute Engine disk
    update: async (diskId, updateData) => {
      try {
        const response = await apiClient.put(`/api/compute-engine/disks/${diskId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete Compute Engine disk
    delete: async (diskId) => {
      try {
        const response = await apiClient.delete(`/api/compute-engine/disks/${diskId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Attach disk to instance
    attach: async (diskId, instanceId) => {
      try {
        const response = await apiClient.post(`/api/compute-engine/disks/${diskId}/attach`, { instanceId });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Detach disk from instance
    detach: async (diskId, instanceId) => {
      try {
        const response = await apiClient.post(`/api/compute-engine/disks/${diskId}/detach`, { instanceId });
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Networks
  networks: {
    // Get Compute Engine networks
    getAll: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`/api/compute-engine/networks?page=${page}&limit=${limit}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get Compute Engine network details
    getById: async (networkId) => {
      try {
        const response = await apiClient.get(`/api/compute-engine/networks/${networkId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create Compute Engine network
    create: async (networkData) => {
      try {
        const response = await apiClient.post('/api/compute-engine/networks', networkData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update Compute Engine network
    update: async (networkId, updateData) => {
      try {
        const response = await apiClient.put(`/api/compute-engine/networks/${networkId}`, updateData);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete Compute Engine network
    delete: async (networkId) => {
      try {
        const response = await apiClient.delete(`/api/compute-engine/networks/${networkId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  },

  // Machine Types
  machineTypes: {
    // Get available machine types
    getAll: async () => {
      try {
        const response = await apiClient.get('/api/compute-engine/machine-types');
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Get machine type details
    getById: async (machineTypeId) => {
      try {
        const response = await apiClient.get(`/api/compute-engine/machine-types/${machineTypeId}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    }
  }
}; 