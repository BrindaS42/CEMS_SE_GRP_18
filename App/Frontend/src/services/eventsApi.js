// eventsApi.js

import api from './api';

export const eventsApi = {
  // Get all events
  getAllEvents: async () => {
    try {
      const response = await api.get('/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  // Get current events
  getCurrentEvents: async () => {
    try {
      const response = await api.get('/events/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current events:', error);
      throw error;
    }
  },

  // Get upcoming events
  getUpcomingEvents: async () => {
    try {
      const response = await api.get('/events/upcoming');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update event
  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (id) => {
    try {
      await api.delete(`/events/${id}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  },

  // Publish event
  publishEvent: async (id) => {
    try {
      const response = await api.patch(`/events/${id}/publish`);
      return response.data;
    } catch (error) {
      console.error('Error publishing event:', error);
      throw error;
    }
  },
};