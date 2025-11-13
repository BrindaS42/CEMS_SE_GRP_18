import { api } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Mock data for events
const mockEvents = [
  {
    _id: '1',
    title: 'TechFest 2024 - Coding Marathon',
    description: 'Join us for the biggest coding event of the year! Compete with top coders, learn from industry experts, and win amazing prizes.',
    organizer: { _id: 'org1', name: 'Tech Club', email: 'tech@college.edu' },
    categoryTags: ['Technology', 'Coding', 'Competition'],
    venue: { address: 'Main Auditorium, Building A', coordinates: { latitude: 0, longitude: 0 } },
    registrationCount: 245,
    gallery: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    ],
    status: 'published',
    timeline: [
      { date: new Date('2024-12-15'), time: '10:00 AM', message: 'Registration Opens' },
      { date: new Date('2024-12-20'), time: '09:00 AM', message: 'Event Begins' },
    ],
    announcements: [
      { title: 'Important Update', message: 'Venue changed to Main Auditorium', date: new Date() },
    ],
    winners: [],
    subEvents: [
      { title: 'Hackathon', description: '24-hour coding challenge' },
      { title: 'Tech Quiz', description: 'Test your tech knowledge' },
    ],
    poc: { name: 'John Doe', contact: '+1234567890' },
  },
  {
    _id: '2',
    title: 'Cultural Night 2024',
    description: 'Experience the diversity of cultures through music, dance, and art performances.',
    organizer: { _id: 'org2', name: 'Cultural Committee', email: 'culture@college.edu' },
    categoryTags: ['Cultural', 'Performance', 'Art'],
    venue: { address: 'Open Air Theatre', coordinates: { latitude: 0, longitude: 0 } },
    registrationCount: 180,
    gallery: [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    ],
    status: 'published',
    timeline: [],
    announcements: [],
    winners: [],
    subEvents: [],
  },
  {
    _id: '3',
    title: 'Sports Championship',
    description: 'Inter-college sports tournament featuring multiple sports categories.',
    organizer: { _id: 'org3', name: 'Sports Committee', email: 'sports@college.edu' },
    categoryTags: ['Sports', 'Competition', 'Team'],
    venue: { address: 'Sports Complex', coordinates: { latitude: 0, longitude: 0 } },
    registrationCount: 320,
    gallery: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    ],
    status: 'published',
    timeline: [],
    announcements: [],
    winners: [],
    subEvents: [],
  },
];

export const eventService = {
  // Get all events with optional filters
  getEvents: async (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredEvents = [...mockEvents];
        
        if (params?.search) {
          filteredEvents = filteredEvents.filter(event =>
            event.title.toLowerCase().includes(params.search.toLowerCase()) ||
            event.description.toLowerCase().includes(params.search.toLowerCase())
          );
        }
        
        if (params?.categoryTags && params.categoryTags.length > 0) {
          filteredEvents = filteredEvents.filter(event =>
            event.categoryTags?.some(tag => params.categoryTags.includes(tag))
          );
        }
        
        resolve({
          data: filteredEvents,
          pagination: {
            currentPage: params?.page || 1,
            totalPages: 1,
            totalItems: filteredEvents.length,
            itemsPerPage: params?.limit || 10,
          },
        });
      }, 300);
    });
  },

  // Get single event by ID
  getEventById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const event = mockEvents.find(e => e._id === id);
        if (event) {
          resolve({ data: event });
        } else {
          reject(new Error('Event not found'));
        }
      }, 300);
    });
  },

  // Create new event
  createEvent: async (eventData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newEvent = {
          _id: Date.now().toString(),
          ...eventData,
        };
        mockEvents.push(newEvent);
        resolve({ data: newEvent });
      }, 500);
    });
  },

  // Update event
  updateEvent: async (id, eventData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockEvents.findIndex(e => e._id === id);
        if (index !== -1) {
          mockEvents[index] = { ...mockEvents[index], ...eventData };
          resolve({ data: mockEvents[index] });
        } else {
          reject(new Error('Event not found'));
        }
      }, 500);
    });
  },

  // Delete event
  deleteEvent: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockEvents.findIndex(e => e._id === id);
        if (index !== -1) {
          mockEvents.splice(index, 1);
          resolve({ data: undefined });
        } else {
          reject(new Error('Event not found'));
        }
      }, 500);
    });
  },

  // Publish event
  publishEvent: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const event = mockEvents.find(e => e._id === id);
        if (event) {
          event.status = 'published';
          resolve({ data: event });
        } else {
          reject(new Error('Event not found'));
        }
      }, 500);
    });
  },

  // Get trending events
  getTrendingEvents: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockEvents.slice(0, 3) });
      }, 300);
    });
  },

  // Get recommended events
  getRecommendedEvents: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockEvents });
      }, 300);
    });
  },
};
