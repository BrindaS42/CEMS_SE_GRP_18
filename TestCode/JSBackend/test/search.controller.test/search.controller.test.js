import { jest } from '@jest/globals';
import { globalSearch } from '../../controllers/search.controller.js';
import Event from '../../models/event.model.js';
import User from '../../models/user.model.js';

// Mock the Event model methods
Event.find = jest.fn();
Event.findById = jest.fn();

// Mock the User model methods
User.find = jest.fn();
User.findById = jest.fn();

describe('Search Controller', () => {
  let req, res;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('globalSearch', () => {
    it('should return 400 if query parameter q is missing', async () => {
      req.query = {};

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required.' });
      expect(Event.find).not.toHaveBeenCalled();
      expect(User.find).not.toHaveBeenCalled();
    });

    it('should return 400 if query parameter q is empty string', async () => {
      req.query = { q: '' };

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required.' });
    });

    it('should return 400 if query parameter q is only whitespace', async () => {
      req.query = { q: '   ' };

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required.' });
    });

    it('should return 400 if query parameter q is null', async () => {
      req.query = { q: null };

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required.' });
    });

    it('should return 400 if query parameter q is undefined', async () => {
      req.query = { q: undefined };

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required.' });
    });

    it('should return 400 if query parameter q is 0', async () => {
      req.query = { q: 0 };

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required.' });
    });

    it('should return 400 if query parameter q is false', async () => {
      req.query = { q: false };

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query is required.' });
    });

    it('should search events and users successfully', async () => {
      req.query = { q: 'test' };
      
      const mockEvents = [
        { _id: 'e1', title: 'Test Event', description: 'Desc', posterUrl: 'url1', categoryTags: ['tech'], timeline: {}, venue: 'Place', config: {} }
      ];
      const mockUsers = [
        { _id: 'u1', profile: { name: 'Test User' }, role: 'student', email: 'test@test.com' },
        { _id: 'u2', profile: { name: 'Org User' }, role: 'organizer', email: 'org@test.com' },
        { _id: 'u3', profile: { name: 'Sponsor User' }, role: 'sponsor', email: 'sponsor@test.com', sponsorDetails: {} }
      ];

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockEvents)
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(Event.find).toHaveBeenCalledWith({
        $or: [
          { title: expect.any(RegExp) },
          { description: expect.any(RegExp) },
          { categoryTags: expect.any(RegExp) }
        ],
        status: 'published'
      });
      expect(User.find).toHaveBeenCalledWith({
        $or: [
          { 'profile.name': expect.any(RegExp) },
          { email: expect.any(RegExp) },
          { 'sponsorDetails.firmDescription': expect.any(RegExp) }
        ]
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        events: mockEvents,
        sponsors: [mockUsers[2]],
        organizers: [mockUsers[1]],
        users: [mockUsers[0]]
      });
    });

    it('should trim whitespace from search query', async () => {
      req.query = { q: '  test  ' };
      
      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      const eventCall = Event.find.mock.calls[0][0];
      expect(eventCall.$or[0].title.source).toBe('test');
    });

    it('should return empty arrays when no results found', async () => {
      req.query = { q: 'nonexistent' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        events: [],
        sponsors: [],
        organizers: [],
        users: []
      });
    });

    it('should filter users by role correctly - only sponsors', async () => {
      req.query = { q: 'test' };

      const mockUsers = [
        { _id: 'u1', role: 'sponsor', profile: { name: 'S1' } },
        { _id: 'u2', role: 'sponsor', profile: { name: 'S2' } }
      ];

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(res.json).toHaveBeenCalledWith({
        events: [],
        sponsors: mockUsers,
        organizers: [],
        users: []
      });
    });

    it('should filter users by role correctly - only organizers', async () => {
      req.query = { q: 'test' };

      const mockUsers = [
        { _id: 'u1', role: 'organizer', profile: { name: 'O1' } },
        { _id: 'u2', role: 'organizer', profile: { name: 'O2' } }
      ];

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(res.json).toHaveBeenCalledWith({
        events: [],
        sponsors: [],
        organizers: mockUsers,
        users: []
      });
    });

    it('should filter users by role correctly - only students', async () => {
      req.query = { q: 'test' };

      const mockUsers = [
        { _id: 'u1', role: 'student', profile: { name: 'S1' } },
        { _id: 'u2', role: 'student', profile: { name: 'S2' } }
      ];

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(res.json).toHaveBeenCalledWith({
        events: [],
        sponsors: [],
        organizers: [],
        users: mockUsers
      });
    });

    it('should handle special characters in search query', async () => {
      req.query = { q: 'test@#$%' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle long search query', async () => {
      req.query = { q: 'a'.repeat(500) };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should limit events to 10 results', async () => {
      req.query = { q: 'test' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(eventQuery.limit).toHaveBeenCalledWith(10);
    });

    it('should limit users to 20 results', async () => {
      req.query = { q: 'test' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(userQuery.limit).toHaveBeenCalledWith(20);
    });

    it('should select correct fields for events', async () => {
      req.query = { q: 'test' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(eventQuery.select).toHaveBeenCalledWith('title description posterUrl categoryTags timeline venue config');
    });

    it('should select correct fields for users', async () => {
      req.query = { q: 'test' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      expect(userQuery.select).toHaveBeenCalledWith('profile role email sponsorDetails');
    });

    it('should only search published events', async () => {
      req.query = { q: 'test' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      const eventCall = Event.find.mock.calls[0][0];
      expect(eventCall.status).toBe('published');
    });

    it('should handle database error from Event.find', async () => {
      req.query = { q: 'test' };
      
      const error = new Error('Event database error');
      Event.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(error)
      });
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });

      await globalSearch(req, res);

      expect(console.error).toHaveBeenCalledWith('Global search error:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during search.',
        error: 'Event database error'
      });
    });

    it('should handle database error from User.find', async () => {
      req.query = { q: 'test' };
      
      const error = new Error('User database error');
      Event.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      });
      User.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(error)
      });

      await globalSearch(req, res);

      expect(console.error).toHaveBeenCalledWith('Global search error:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during search.',
        error: 'User database error'
      });
    });

    it('should handle error without message property', async () => {
      req.query = { q: 'test' };
      
      const error = { toString: () => 'Unknown error' };
      Event.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(error)
      });

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during search.',
        error: undefined
      });
    });

    it('should handle synchronous error', async () => {
      req.query = { q: 'test' };
      
      Event.find.mockImplementation(() => {
        throw new Error('Sync error');
      });

      await globalSearch(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during search.',
        error: 'Sync error'
      });
    });

    it('should handle mixed role users', async () => {
      req.query = { q: 'test' };

      const mockUsers = [
        { _id: 'u1', role: 'student', profile: { name: 'Student 1' } },
        { _id: 'u2', role: 'organizer', profile: { name: 'Organizer 1' } },
        { _id: 'u3', role: 'sponsor', profile: { name: 'Sponsor 1' } },
        { _id: 'u4', role: 'student', profile: { name: 'Student 2' } },
        { _id: 'u5', role: 'organizer', profile: { name: 'Organizer 2' } }
      ];

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.sponsors).toHaveLength(1);
      expect(response.organizers).toHaveLength(2);
      expect(response.users).toHaveLength(2);
    });

    it('should create case-insensitive regex', async () => {
      req.query = { q: 'Test' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      const eventCall = Event.find.mock.calls[0][0];
      expect(eventCall.$or[0].title.flags).toContain('i');
    });

    it('should verify return value on validation failure', async () => {
      req.query = {};
      res.json.mockReturnValue('validation_return');

      const result = await globalSearch(req, res);

      expect(result).toBe('validation_return');
    });

    it('should verify return value on success', async () => {
      req.query = { q: 'test' };

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      const result = await globalSearch(req, res);

      expect(result).toBeUndefined();
    });

    it('should verify return value on error', async () => {
      req.query = { q: 'test' };

      Event.find.mockImplementation(() => {
        throw new Error('test');
      });

      const result = await globalSearch(req, res);

      expect(result).toBeUndefined();
    });

    it('should handle users with unknown roles', async () => {
      req.query = { q: 'test' };

      const mockUsers = [
        { _id: 'u1', role: 'admin', profile: { name: 'Admin' } },
        { _id: 'u2', role: 'unknown', profile: { name: 'Unknown' } }
      ];

      const eventQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([])
      };
      const userQuery = {
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUsers)
      };

      Event.find.mockReturnValue(eventQuery);
      User.find.mockReturnValue(userQuery);

      await globalSearch(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.sponsors).toHaveLength(0);
      expect(response.organizers).toHaveLength(0);
      expect(response.users).toHaveLength(0);
    });
  });
});
