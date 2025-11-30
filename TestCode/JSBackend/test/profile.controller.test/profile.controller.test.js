import { jest } from '@jest/globals';
import {
  getUserProfileById,
  getUserProfile,
  updateUserProfile,
  getAllStudents,
  getAllOrganizers,
  getAllSponsors,
  getAllAdmins
} from '../../controllers/profile.controller.js';
import User from '../../models/user.model.js';
import mongoose from 'mongoose';

// --- MOCKS ---
jest.mock('../../models/user.model.js', () => ({
  default: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn()
  }
}));

jest.mock('mongoose', () => ({
  default: {
    Types: {
      ObjectId: {
        isValid: jest.fn()
      }
    }
  }
}));

describe('Profile Controller', () => {
  let req, res;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = {
      params: {},
      user: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getUserProfileById', () => {
    it('should return 400 if user ID is invalid', async () => {
      req.params.id = 'invalid-id';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(false) } };

      await getUserProfileById(req, res);

      expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalid-id');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid user ID' });
    });

    it('should return 404 if user not found', async () => {
      req.params.id = 'validid123';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(true) } };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null)
      };
      User.findById = jest.fn().mockReturnValue(mockQuery);

      await getUserProfileById(req, res);

      expect(User.findById).toHaveBeenCalledWith('validid123');
      expect(mockQuery.select).toHaveBeenCalledWith('profile role email sponsorDetails college');
      expect(mockQuery.populate).toHaveBeenCalledWith('college', 'name');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return user profile successfully', async () => {
      req.params.id = 'validid123';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(true) } };
      const mockUser = {
        _id: 'user1',
        profile: { name: 'Test User' },
        role: 'student',
        email: 'test@test.com'
      };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(mockUser)
      };
      User.findById = jest.fn().mockReturnValue(mockQuery);

      await getUserProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, user: mockUser });
    });

    it('should handle database error', async () => {
      req.params.id = 'validid123';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(true) } };
      const error = new Error('Database error');
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(error)
      };
      User.findById = jest.fn().mockReturnValue(mockQuery);

      await getUserProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error', error: 'Database error' });
      expect(console.error).toHaveBeenCalledWith('Error fetching user profile by ID:', error);
    });

    it('should handle error without message property', async () => {
      req.params.id = 'validid123';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(true) } };
      const error = { code: 500 };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockRejectedValue(error)
      };
      User.findById = jest.fn().mockReturnValue(mockQuery);

      await getUserProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Server error', error: undefined });
    });

    it('should handle empty id parameter', async () => {
      req.params.id = '';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(false) } };

      await getUserProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid user ID' });
    });

    it('should handle null id parameter', async () => {
      req.params.id = null;
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(false) } };

      await getUserProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle undefined id parameter', async () => {
      req.params.id = undefined;
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(false) } };

      await getUserProfileById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should populate college with name field only', async () => {
      req.params.id = 'validid123';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(true) } };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue({ _id: 'user1' })
      };
      User.findById = jest.fn().mockReturnValue(mockQuery);

      await getUserProfileById(req, res);

      expect(mockQuery.populate).toHaveBeenCalledWith('college', 'name');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should select specific fields only', async () => {
      req.params.id = 'validid123';
      mongoose.Types = { ObjectId: { isValid: jest.fn().mockReturnValue(true) } };
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue({ _id: 'user1' })
      };
      User.findById = jest.fn().mockReturnValue(mockQuery);

      await getUserProfileById(req, res);

      expect(mockQuery.select).toHaveBeenCalledWith('profile role email sponsorDetails college');
    });
  });

  describe('getUserProfile', () => {
    it('should return 404 if user not found', async () => {
      req.user = { id: 'user123' };
      User.findById = jest.fn().mockResolvedValue(null);

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return user profile successfully', async () => {
      req.user = { id: 'user123' };
      const mockUser = {
        _id: 'user123',
        profile: { name: 'Test User' },
        role: 'student',
        email: 'test@test.com',
        passwordHash: 'hashedpass',
        __v: 0,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          profile: { name: 'Test User' },
          role: 'student',
          email: 'test@test.com',
          passwordHash: 'hashedpass',
          __v: 0
        })
      };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await getUserProfile(req, res);

      expect(mockUser.toObject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user123',
        profile: { name: 'Test User' },
        role: 'student',
        email: 'test@test.com'
      }));
      expect(res.json).toHaveBeenCalledWith(expect.not.objectContaining({
        _id: expect.anything(),
        passwordHash: expect.anything(),
        __v: expect.anything()
      }));
    });

    it('should remove sensitive fields from response', async () => {
      req.user = { id: 'user123' };
      const mockUser = {
        _id: 'user123',
        passwordHash: 'secrethash',
        __v: 2,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          passwordHash: 'secrethash',
          __v: 2
        })
      };
      User.findById = jest.fn().mockResolvedValue(mockUser);

      await getUserProfile(req, res);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData).not.toHaveProperty('_id');
      expect(responseData).not.toHaveProperty('passwordHash');
      expect(responseData).not.toHaveProperty('__v');
      expect(responseData).toHaveProperty('id', 'user123');
    });

    it('should handle database error', async () => {
      req.user = { id: 'user123' };
      const error = new Error('Database error');
      User.findById = jest.fn().mockRejectedValue(error);

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch profile' });
    });

    it('should handle undefined req.user', async () => {
      req.user = undefined;
      User.findById = jest.fn().mockResolvedValue(null);

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(undefined);
    });

    it('should handle null req.user.id', async () => {
      req.user = { id: null };
      User.findById = jest.fn().mockResolvedValue(null);

      await getUserProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith(null);
    });

    it('should handle synchronous error', async () => {
      req.user = { id: 'user123' };
      User.findById = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(console.error).toHaveBeenCalledWith('getUserProfile error', expect.any(Error));
    });

    it('should return empty object if user is falsy after deletion', async () => {
      req.user = { id: 'user123' };
      User.findById = jest.fn().mockResolvedValue(null);

      await getUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('updateUserProfile', () => {
    it('should return 404 if user not found', async () => {
      req.user = { id: 'user123' };
      req.body = { name: 'New Name' };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { 'profile.name': 'New Name' } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should update user profile successfully with profile fields', async () => {
      req.user = { id: 'user123' };
      req.body = {
        name: 'Updated Name',
        bio: 'Updated Bio'
      };
      const mockUser = {
        _id: 'user123',
        profile: { name: 'Updated Name', bio: 'Updated Bio' },
        passwordHash: 'hash',
        __v: 0,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          profile: { name: 'Updated Name', bio: 'Updated Bio' },
          passwordHash: 'hash',
          __v: 0
        })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { 'profile.name': 'Updated Name', 'profile.bio': 'Updated Bio' } },
        { new: true, runValidators: true }
      );
      expect(mockUser.toObject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user123',
        profile: { name: 'Updated Name', bio: 'Updated Bio' }
      }));
    });

    it('should update user profile with sponsorDetails', async () => {
      req.user = { id: 'sponsor123' };
      req.body = {
        name: 'Sponsor Name',
        sponsorDetails: {
          company: 'Test Company',
          website: 'https://example.com'
        }
      };
      const mockUser = {
        _id: 'sponsor123',
        sponsorDetails: { company: 'Test Company', website: 'https://example.com' },
        passwordHash: 'hash',
        __v: 0,
        toObject: jest.fn().mockReturnValue({
          _id: 'sponsor123',
          sponsorDetails: { company: 'Test Company', website: 'https://example.com' },
          passwordHash: 'hash',
          __v: 0
        })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'sponsor123',
        { 
          $set: { 
            'profile.name': 'Sponsor Name',
            'sponsorDetails.company': 'Test Company',
            'sponsorDetails.website': 'https://example.com'
          } 
        },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle empty req.body', async () => {
      req.user = { id: 'user123' };
      req.body = {};
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ _id: 'user123', passwordHash: 'hash', __v: 0 })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: {} },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle undefined req.body', async () => {
      req.user = { id: 'user123' };
      req.body = undefined;
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ _id: 'user123', passwordHash: 'hash', __v: 0 })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: {} },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle null sponsorDetails', async () => {
      req.user = { id: 'user123' };
      req.body = { name: 'Test', sponsorDetails: null };
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ _id: 'user123', passwordHash: 'hash', __v: 0 })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { 'profile.name': 'Test' } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle non-object sponsorDetails', async () => {
      req.user = { id: 'user123' };
      req.body = { name: 'Test', sponsorDetails: 'notanobject' };
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ _id: 'user123', passwordHash: 'hash', __v: 0 })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { 'profile.name': 'Test' } },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle database error', async () => {
      req.user = { id: 'user123' };
      req.body = { name: 'Test' };
      const error = new Error('Database error');
      User.findByIdAndUpdate = jest.fn().mockRejectedValue(error);

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update profile' });
      expect(console.error).toHaveBeenCalledWith('updateUserProfile error', error);
    });

    it('should remove sensitive fields from response', async () => {
      req.user = { id: 'user123' };
      req.body = { name: 'Test' };
      const mockUser = {
        _id: 'user123',
        passwordHash: 'secrethash',
        __v: 2,
        toObject: jest.fn().mockReturnValue({
          _id: 'user123',
          passwordHash: 'secrethash',
          __v: 2
        })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData).not.toHaveProperty('_id');
      expect(responseData).not.toHaveProperty('passwordHash');
      expect(responseData).not.toHaveProperty('__v');
      expect(responseData).toHaveProperty('id', 'user123');
    });

    it('should use Object.prototype.hasOwnProperty for profile fields', async () => {
      req.user = { id: 'user123' };
      const bodyWithPrototype = Object.create({ inherited: 'value' });
      bodyWithPrototype.name = 'Test';
      bodyWithPrototype.customProperty = 'value';
      req.body = bodyWithPrototype;
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ _id: 'user123', passwordHash: 'hash', __v: 0 })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { 'profile.name': 'Test', 'profile.customProperty': 'value' } },
        { new: true, runValidators: true }
      );
    });

    it('should use Object.prototype.hasOwnProperty for sponsorDetails', async () => {
      req.user = { id: 'user123' };
      const sponsorDetailsWithPrototype = Object.create({ inherited: 'value' });
      sponsorDetailsWithPrototype.company = 'Test';
      sponsorDetailsWithPrototype.customProp = 'value';
      req.body = { sponsorDetails: sponsorDetailsWithPrototype };
      const mockUser = {
        toObject: jest.fn().mockReturnValue({ _id: 'user123', passwordHash: 'hash', __v: 0 })
      };
      User.findByIdAndUpdate = jest.fn().mockResolvedValue(mockUser);

      await updateUserProfile(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { $set: { 'sponsorDetails.company': 'Test', 'sponsorDetails.customProp': 'value' } },
        { new: true, runValidators: true }
      );
    });

    it('should handle synchronous error', async () => {
      req.user = { id: 'user123' };
      req.body = { name: 'Test' };
      User.findByIdAndUpdate = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      await updateUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(console.error).toHaveBeenCalledWith('updateUserProfile error', expect.any(Error));
    });
  });

  describe('getAllStudents', () => {
    it('should return all students successfully', async () => {
      const mockStudents = [
        {
          _id: 'student1',
          role: 'student',
          passwordHash: 'hash1',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'student1',
            role: 'student',
            passwordHash: 'hash1',
            __v: 0
          })
        },
        {
          _id: 'student2',
          role: 'student',
          passwordHash: 'hash2',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'student2',
            role: 'student',
            passwordHash: 'hash2',
            __v: 0
          })
        }
      ];
      User.find = jest.fn().mockResolvedValue(mockStudents);

      await getAllStudents(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'student' });
      expect(mockStudents[0].toObject).toHaveBeenCalled();
      expect(mockStudents[1].toObject).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'student1', role: 'student' }),
        expect.objectContaining({ id: 'student2', role: 'student' })
      ]));
    });

    it('should return empty array when no students found', async () => {
      User.find = jest.fn().mockResolvedValue([]);

      await getAllStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      User.find = jest.fn().mockRejectedValue(error);

      await getAllStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch students' });
    });

    it('should handle synchronous error', async () => {
      User.find = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      await getAllStudents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(console.error).toHaveBeenCalledWith('getAllStudents error', expect.any(Error));
    });
  });

  describe('getAllOrganizers', () => {
    it('should return all organizers successfully', async () => {
      const mockOrganizers = [
        {
          _id: 'org1',
          role: 'organizer',
          passwordHash: 'hash1',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'org1',
            role: 'organizer',
            passwordHash: 'hash1',
            __v: 0
          })
        },
        {
          _id: 'org2',
          role: 'organizer',
          passwordHash: 'hash2',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'org2',
            role: 'organizer',
            passwordHash: 'hash2',
            __v: 0
          })
        }
      ];
      User.find = jest.fn().mockResolvedValue(mockOrganizers);

      await getAllOrganizers(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'organizer' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'org1', role: 'organizer' }),
        expect.objectContaining({ id: 'org2', role: 'organizer' })
      ]));
    });

    it('should return empty array when no organizers found', async () => {
      User.find = jest.fn().mockResolvedValue([]);

      await getAllOrganizers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      User.find = jest.fn().mockRejectedValue(error);

      await getAllOrganizers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch organizers' });
    });

    it('should handle synchronous error', async () => {
      User.find = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      await getAllOrganizers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(console.error).toHaveBeenCalledWith('getAllOrganizers error', expect.any(Error));
    });
  });

  describe('getAllSponsors', () => {
    it('should return all sponsors successfully', async () => {
      const mockSponsors = [
        {
          _id: 'sponsor1',
          role: 'sponsor',
          passwordHash: 'hash1',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'sponsor1',
            role: 'sponsor',
            passwordHash: 'hash1',
            __v: 0
          })
        },
        {
          _id: 'sponsor2',
          role: 'sponsor',
          passwordHash: 'hash2',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'sponsor2',
            role: 'sponsor',
            passwordHash: 'hash2',
            __v: 0
          })
        }
      ];
      User.find = jest.fn().mockResolvedValue(mockSponsors);

      await getAllSponsors(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'sponsor' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'sponsor1', role: 'sponsor' }),
        expect.objectContaining({ id: 'sponsor2', role: 'sponsor' })
      ]));
    });

    it('should return empty array when no sponsors found', async () => {
      User.find = jest.fn().mockResolvedValue([]);

      await getAllSponsors(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      User.find = jest.fn().mockRejectedValue(error);

      await getAllSponsors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch sponsors' });
    });

    it('should handle synchronous error', async () => {
      User.find = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      await getAllSponsors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(console.error).toHaveBeenCalledWith('getAllSponsors error', expect.any(Error));
    });
  });

  describe('getAllAdmins', () => {
    it('should return all admins successfully', async () => {
      const mockAdmins = [
        {
          _id: 'admin1',
          role: 'admin',
          passwordHash: 'hash1',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'admin1',
            role: 'admin',
            passwordHash: 'hash1',
            __v: 0
          })
        },
        {
          _id: 'admin2',
          role: 'admin',
          passwordHash: 'hash2',
          __v: 0,
          toObject: jest.fn().mockReturnValue({
            _id: 'admin2',
            role: 'admin',
            passwordHash: 'hash2',
            __v: 0
          })
        }
      ];
      User.find = jest.fn().mockResolvedValue(mockAdmins);

      await getAllAdmins(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 'admin1', role: 'admin' }),
        expect.objectContaining({ id: 'admin2', role: 'admin' })
      ]));
    });

    it('should return empty array when no admins found', async () => {
      User.find = jest.fn().mockResolvedValue([]);

      await getAllAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      User.find = jest.fn().mockRejectedValue(error);

      await getAllAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch admins' });
    });

    it('should handle synchronous error', async () => {
      User.find = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });

      await getAllAdmins(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(console.error).toHaveBeenCalledWith('getAllAdmins error', expect.any(Error));
    });
  });
});
