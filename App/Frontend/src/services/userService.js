import { api } from './apiService';
import { API_ENDPOINTS } from '../config/api';

// Mock user data
const createMockUser = (role, email) => ({
  _id: `user_${role}`,
  username: email.split('@')[0],
  email: email,
  role: role,
  college: { _id: 'college1', name: 'National Institute of Technology' },
  profile: {
    name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
    contactNo: '+1234567890',
    profilePic: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400`,
    dob: '1995-01-01',
    address: '123 College Street',
    linkedin: 'https://linkedin.com/in/user',
    github: 'https://github.com/user',
    areasOfInterest: ['Technology', 'Innovation', 'Leadership'],
    pastAchievements: [
      {
        title: 'Best Project Award',
        description: 'Won first prize in annual tech fest',
        proof: 'https://example.com/certificate',
      },
    ],
  },
});

export const userService = {
  // Get current user profile
  getCurrentUserProfile: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const userData = JSON.parse(atob(token.split('.')[1]));
            const user = createMockUser(userData.role, userData.email);
            resolve({ data: user });
          } catch {
            resolve({ data: createMockUser('student', 'student@college.edu') });
          }
        } else {
          resolve({ data: createMockUser('student', 'student@college.edu') });
        }
      }, 300);
    });
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const token = localStorage.getItem('authToken');
        const userData = token ? JSON.parse(atob(token.split('.')[1])) : { role: 'student', email: 'student@college.edu' };
        const user = createMockUser(userData.role, userData.email);
        user.profile = { ...user.profile, ...profileData };
        resolve({ data: user });
      }, 500);
    });
  },

  // Get user by ID
  getUserById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = createMockUser('student', 'user@college.edu');
        user._id = id;
        resolve({ data: user });
      }, 300);
    });
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a mock URL for the uploaded file
        const url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400';
        resolve({ data: { url } });
      }, 1000);
    });
  },
};
