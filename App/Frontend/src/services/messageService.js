import { api } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Mock messages data
const mockMessages = [
  {
    _id: '1',
    type: 'registration',
    relatedId: 'event1',
    content: {
      title: 'Registration Request for TechFest 2024',
      message: 'Your registration for TechFest 2024 has been received and is under review.',
    },
    read: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: '2',
    type: 'teamInvite',
    relatedId: 'team1',
    content: {
      title: 'Team Invitation for Hackathon',
      message: 'You have been invited to join team "Code Warriors" for the upcoming hackathon.',
    },
    read: false,
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    _id: '3',
    type: 'announcement',
    relatedId: 'event2',
    content: {
      title: 'Event Update: Cultural Night',
      message: 'Venue has been changed to Open Air Theatre. Please check the updated details.',
    },
    read: true,
    createdAt: new Date(Date.now() - 86400000),
  },
];

export const messageService = {
  // Get all messages for current user
  getMessages: async (params) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: [...mockMessages] });
      }, 300);
    });
  },

  // Get unread message count
  getUnreadCount: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const count = mockMessages.filter(m => !m.read).length;
        resolve({ data: { count } });
      }, 200);
    });
  },

  // Mark message as read
  markAsRead: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const message = mockMessages.find(m => m._id === id);
        if (message) {
          message.read = true;
          resolve({ data: message });
        } else {
          reject(new Error('Message not found'));
        }
      }, 200);
    });
  },

  // Delete message
  deleteMessage: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockMessages.findIndex(m => m._id === id);
        if (index !== -1) {
          mockMessages.splice(index, 1);
          resolve({ data: undefined });
        } else {
          reject(new Error('Message not found'));
        }
      }, 200);
    });
  },

  // Send message
  sendMessage: async (messageData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage = {
          _id: Date.now().toString(),
          type: messageData.type || 'announcement',
          relatedId: messageData.relatedId || '',
          content: messageData.content || { title: '', message: '' },
          read: false,
          createdAt: new Date(),
        };
        mockMessages.unshift(newMessage);
        resolve({ data: newMessage });
      }, 300);
    });
  },

  // Create message (for inbox compose)
  createMessage: async (messageData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage = {
          _id: Date.now().toString(),
          ...messageData,
          createdAt: new Date().toISOString(),
        };
        resolve({ data: newMessage });
      }, 300);
    });
  },

  // Update message approval status
  updateMessageApproval: async (messageId, action) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            _id: messageId,
            approvalStatus: action === 'accept' ? 'approved' : 'rejected',
          },
        });
      }, 300);
    });
  },
};
