import { api } from './apiService';
import { API_ENDPOINTS } from '../config/api';

export const registrationService = {
  // Create registration
  createRegistration: async (registrationData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            _id: Date.now().toString(),
            ...registrationData,
            status: 'pending',
            createdAt: new Date(),
          },
        });
      }, 500);
    });
  },

  // Check for event clashes
  checkClashes: async (eventId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: No clashes for demo
        resolve({
          data: {
            hasClash: false,
            events: [],
          },
        });
      }, 300);
    });
  },

  // Get user registrations
  getUserRegistrations: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              _id: '1',
              event: { _id: '1', title: 'TechFest 2024' },
              status: 'pending',
              type: 'single',
              createdAt: new Date(),
            },
          ],
        });
      }, 300);
    });
  },

  // Accept registration
  acceptRegistration: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            _id: id,
            status: 'approved',
          },
        });
      }, 300);
    });
  },

  // Reject registration
  rejectRegistration: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            _id: id,
            status: 'rejected',
          },
        });
      }, 300);
    });
  },

  // Register for event
  registerForEvent: async (eventId, formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            _id: Date.now().toString(),
            eventId,
            ...formData,
            status: 'pending',
            createdAt: new Date(),
          },
        });
      }, 500);
    });
  },

  // Check registration status
  checkRegistration: async (eventId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock: Not registered for demo
        resolve({
          data: {
            isRegistered: false,
          },
        });
      }, 300);
    });
  },
};
