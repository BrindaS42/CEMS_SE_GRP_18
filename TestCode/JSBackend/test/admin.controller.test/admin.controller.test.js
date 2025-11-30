import { jest } from '@jest/globals';
import {
  handleCollegeRegistration,
  getAllEventsForAdmin,
  getAllUsersForAdmin,
  getAllAdsForAdmin,
  suspendCollegeAndEntities,
  unsuspendCollegeAndEntities,
  toggleSuspension,
  createReport
} from '../../controllers/admin.controller.js';
import Event from '../../models/event.model.js';
import College from '../../models/college.model.js';
import User from '../../models/user.model.js';
import Team from '../../models/organizerTeam.model.js';
import SponsorAd from '../../models/sponsorad.model.js';
import Inbox from '../../models/inbox.model.js';
import mongoose from 'mongoose';

// Mock the model functions
Event.find = jest.fn();
Event.findById = jest.fn();
Event.findByIdAndUpdate = jest.fn();
Event.updateMany = jest.fn();
College.findOneAndUpdate = jest.fn();
College.findById = jest.fn();
User.find = jest.fn();
User.findById = jest.fn();
User.findByIdAndUpdate = jest.fn();
User.updateMany = jest.fn();
Team.findById = jest.fn();
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();
SponsorAd.findByIdAndUpdate = jest.fn();
Inbox.prototype.save = jest.fn();

// Mock mongoose.model
const mockModel = jest.fn();
mongoose.model = mockModel;

jest.mock('../../models/team.model.js');
jest.mock('../../models/user.model.js');
jest.mock('../../models/inbox.model.js');

describe('Admin Controller', () => {
  let req, res, consoleErrorSpy;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: 'adminId123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('handleCollegeRegistration', () => {
    beforeEach(() => {
      req.params.collegeId = 'college123';
      req.body.status = 'Approved';
    });

    it('should return 400 if status is invalid', async () => {
      req.body.status = 'Invalid';

      await handleCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid status provided. Must be 'Approved' or 'Rejected'."
      });
    });

    it('should successfully approve college registration', async () => {
      const mockCollege = {
        _id: 'college123',
        name: 'Test College',
        status: 'Approved',
        approvedBy: 'adminId123'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockCollege);
      College.findOneAndUpdate.mockReturnValue({ select: mockSelect });

      await handleCollegeRegistration(req, res);

      expect(College.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'college123', status: 'Pending' },
        { status: 'Approved', approvedBy: 'adminId123' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'College registration for Test College successfully Approved.',
        college: mockCollege
      });
    });

    it('should successfully reject college registration', async () => {
      req.body.status = 'Rejected';
      const mockCollege = {
        _id: 'college123',
        name: 'Test College',
        status: 'Rejected',
        approvedBy: 'adminId123'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockCollege);
      College.findOneAndUpdate.mockReturnValue({ select: mockSelect });

      await handleCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'College registration for Test College successfully Rejected.',
        college: mockCollege
      });
    });

    it('should return 409 if college is already processed', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      College.findOneAndUpdate.mockReturnValue({ select: mockSelect });
      College.findById.mockResolvedValue({ status: 'Approved' });

      await handleCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conflict: College registration is already Approved. Cannot be updated from Pending.'
      });
    });

    it('should return 404 if college not found', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      College.findOneAndUpdate.mockReturnValue({ select: mockSelect });
      College.findById.mockResolvedValue(null);

      await handleCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'College registration not found.'
      });
    });

    it('should return 400 for invalid college ID format (CastError)', async () => {
      const mockSelect = jest.fn().mockRejectedValue({ name: 'CastError' });
      College.findOneAndUpdate.mockReturnValue({ select: mockSelect });

      await handleCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid College ID format.'
      });
    });

    it('should return 500 on server error', async () => {
      const mockSelect = jest.fn().mockRejectedValue(new Error('Database error'));
      College.findOneAndUpdate.mockReturnValue({ select: mockSelect });

      await handleCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error.',
        error: 'Database error'
      });
    });
  });

  describe('getAllEventsForAdmin', () => {
    it('should return all events successfully', async () => {
      const mockEvents = [
        { _id: 'event1', title: 'Event 1' },
        { _id: 'event2', title: 'Event 2' }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockEvents);
      const mockPopulate2 = jest.fn().mockReturnValue({ sort: mockSort });
      const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
      Event.find.mockReturnValue({ populate: mockPopulate1 });

      await getAllEventsForAdmin(req, res);

      expect(Event.find).toHaveBeenCalledWith({});
      expect(mockPopulate1).toHaveBeenCalledWith('college', 'name');
      expect(mockPopulate2).toHaveBeenCalledWith('createdBy', 'name');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should return 500 on error', async () => {
      const mockPopulate1 = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      Event.find.mockReturnValue({ populate: mockPopulate1 });

      await getAllEventsForAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error while fetching events.'
      });
    });
  });

  describe('getAllUsersForAdmin', () => {
    it('should return all users except current admin', async () => {
      const mockUsers = [
        { _id: 'user1', name: 'User 1' },
        { _id: 'user2', name: 'User 2' }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockUsers);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      User.find.mockReturnValue({ populate: mockPopulate });

      await getAllUsersForAdmin(req, res);

      expect(User.find).toHaveBeenCalledWith({ _id: { $ne: 'adminId123' } });
      expect(mockPopulate).toHaveBeenCalledWith('college', 'name');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 on error', async () => {
      const mockPopulate = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      User.find.mockReturnValue({ populate: mockPopulate });

      await getAllUsersForAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error while fetching users.'
      });
    });
  });

  describe('getAllAdsForAdmin', () => {
    it('should return all ads with sponsor info', async () => {
      const mockAds = [
        { _id: 'ad1', title: 'Ad 1', sponsorId: { _id: 'sponsor1', profile: { name: 'Sponsor 1' } } },
        { _id: 'ad2', title: 'Ad 2', sponsorId: { _id: 'sponsor2', profile: { name: 'Sponsor 2' } } }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockAds);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      SponsorAd.find.mockReturnValue({ populate: mockPopulate });

      await getAllAdsForAdmin(req, res);

      expect(SponsorAd.find).toHaveBeenCalledWith({});
      expect(mockPopulate).toHaveBeenCalledWith({
        path: 'sponsorId',
        select: 'profile.name _id',
        transform: expect.any(Function)
      });
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAds);
    });

    it('should handle deleted sponsor transform', async () => {
      const mockAds = [{ _id: 'ad1', sponsorId: null }];
      const mockSort = jest.fn().mockResolvedValue(mockAds);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      SponsorAd.find.mockReturnValue({ populate: mockPopulate });

      await getAllAdsForAdmin(req, res);

      const populateCall = mockPopulate.mock.calls[0][0];
      const transformedDoc = populateCall.transform(null);
      expect(transformedDoc).toEqual({ _id: null, profile: { name: 'Deleted Sponsor' } });
    });

    it('should handle existing sponsor transform', async () => {
      const mockDoc = { _id: 'sponsor1', profile: { name: 'Test Sponsor' } };
      const mockSort = jest.fn().mockResolvedValue([]);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      SponsorAd.find.mockReturnValue({ populate: mockPopulate });

      await getAllAdsForAdmin(req, res);

      const populateCall = mockPopulate.mock.calls[0][0];
      const transformedDoc = populateCall.transform(mockDoc);
      expect(transformedDoc).toEqual(mockDoc);
    });

    it('should return 500 on error', async () => {
      const mockPopulate = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });
      SponsorAd.find.mockReturnValue({ populate: mockPopulate });

      await getAllAdsForAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error while fetching ads.'
      });
    });
  });

  describe('suspendCollegeAndEntities', () => {
    beforeEach(() => {
      req.params.collegeId = 'college123';
    });

    it('should successfully suspend college and related entities', async () => {
      const mockCollege = {
        _id: 'college123',
        name: 'Test College',
        status: 'Suspended'
      };

      College.findOneAndUpdate.mockResolvedValue(mockCollege);
      User.updateMany.mockResolvedValue({ modifiedCount: 5 });
      Event.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await suspendCollegeAndEntities(req, res);

      expect(College.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'college123', status: 'Approved' },
        { $set: { status: 'Suspended', approvedBy: 'adminId123' } },
        { new: true }
      );
      expect(User.updateMany).toHaveBeenCalledWith(
        { college: 'college123', status: { $ne: 'suspended' } },
        { $set: { status: 'suspended' } }
      );
      expect(Event.updateMany).toHaveBeenCalledWith(
        { college: 'college123', status: { $ne: 'suspended' } },
        { $set: { status: 'suspended' } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "College 'Test College' successfully suspended, and related entities halted.",
        summary: {
          collegeId: 'college123',
          usersSuspended: 5,
          eventsSuspended: 3
        }
      });
    });

    it('should return 409 if college is already suspended', async () => {
      College.findOneAndUpdate.mockResolvedValue(null);
      const mockSelect = jest.fn().mockResolvedValue({ status: 'Suspended' });
      College.findById.mockReturnValue({ select: mockSelect });

      await suspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conflict: College registration is already Suspended. No action taken.'
      });
    });

    it('should return 409 if college status is not Approved', async () => {
      College.findOneAndUpdate.mockResolvedValue(null);
      const mockSelect = jest.fn().mockResolvedValue({ status: 'Pending' });
      College.findById.mockReturnValue({ select: mockSelect });

      await suspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conflict: College status is currently "Pending". Only Approved colleges can be suspended.'
      });
    });

    it('should return 404 if college not found', async () => {
      College.findOneAndUpdate.mockResolvedValue(null);
      const mockSelect = jest.fn().mockResolvedValue(null);
      College.findById.mockReturnValue({ select: mockSelect });

      await suspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'College registration not found.'
      });
    });

    it('should return 400 for invalid college ID format (CastError)', async () => {
      College.findOneAndUpdate.mockRejectedValue({ name: 'CastError' });

      await suspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid College ID format.'
      });
    });

    it('should return 500 on server error', async () => {
      College.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

      await suspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error.',
        error: 'Database error'
      });
    });
  });

  describe('unsuspendCollegeAndEntities', () => {
    beforeEach(() => {
      req.params.collegeId = 'college123';
    });

    it('should successfully unsuspend college and related entities', async () => {
      const mockCollege = {
        _id: 'college123',
        name: 'Test College',
        status: 'Approved'
      };

      College.findOneAndUpdate.mockResolvedValue(mockCollege);
      User.updateMany.mockResolvedValue({ modifiedCount: 5 });
      Event.updateMany.mockResolvedValue({ modifiedCount: 3 });

      await unsuspendCollegeAndEntities(req, res);

      expect(College.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'college123', status: 'Suspended' },
        { $set: { status: 'Approved', approvedBy: 'adminId123' } },
        { new: true }
      );
      expect(User.updateMany).toHaveBeenCalledWith(
        { college: 'college123', status: 'suspended' },
        { $set: { status: 'active' } }
      );
      expect(Event.updateMany).toHaveBeenCalledWith(
        { college: 'college123', status: 'suspended' },
        { $set: { status: 'published' } }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "College 'Test College' successfully unsuspended, and related entities reactivated.",
        summary: {
          collegeId: 'college123',
          usersUnsuspended: 5,
          eventsUnsuspended: 3
        }
      });
    });

    it('should return 409 if college status is not Suspended', async () => {
      College.findOneAndUpdate.mockResolvedValue(null);
      const mockSelect = jest.fn().mockResolvedValue({ status: 'Approved' });
      College.findById.mockReturnValue({ select: mockSelect });

      await unsuspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Conflict: College status is currently "Approved". Only Suspended colleges can be unsuspended.'
      });
    });

    it('should return 404 if college not found', async () => {
      College.findOneAndUpdate.mockResolvedValue(null);
      const mockSelect = jest.fn().mockResolvedValue(null);
      College.findById.mockReturnValue({ select: mockSelect });

      await unsuspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Suspended college registration not found.'
      });
    });

    it('should return 500 on server error', async () => {
      College.findOneAndUpdate.mockRejectedValue(new Error('Database error'));

      await unsuspendCollegeAndEntities(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error.',
        error: 'Database error'
      });
    });
  });

  describe('toggleSuspension', () => {
    let mockInboxEntitySave;

    beforeEach(() => {
      req.params = { modelType: 'user', id: 'user123' };
      req.body = { targetStatus: 'suspended' };

      mockInboxEntitySave = Inbox.prototype.save;
      
      // Properly mock model returns for User and Event
      User.findByIdAndUpdate = jest.fn();
      Event.findByIdAndUpdate = jest.fn();
      SponsorAd.findByIdAndUpdate.mockClear();
    });

    it('should suspend a user and send notification', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        status: 'suspended'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await toggleSuspension(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { status: 'suspended' },
        { new: true, runValidators: true }
      );
      expect(mockInboxEntitySave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user status successfully updated to suspended. Notification queued.',
        document: mockUser
      });
    });

    it('should activate a user and send notification', async () => {
      req.body.targetStatus = 'active';
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        status: 'active'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await toggleSuspension(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { status: 'active' },
        { new: true, runValidators: true }
      );
      expect(mockInboxEntitySave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should suspend an event and notify team leader', async () => {
      req.params.modelType = 'event';
      req.params.id = 'event123';
      
      const mockEvent = {
        _id: 'event123',
        title: 'Test Event',
        status: 'suspended',
        createdBy: 'team123'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockEvent);
      Event.findByIdAndUpdate.mockReturnValue({ select: mockSelect });
      
      const mockTeamSelect = jest.fn().mockResolvedValue({ leader: 'leader123' });
      Team.findById.mockReturnValue({ select: mockTeamSelect });

      await toggleSuspension(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
        'event123',
        { status: 'suspended' },
        { new: true, runValidators: true }
      );
      expect(Team.findById).toHaveBeenCalledWith('team123');
      expect(mockInboxEntitySave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should suspend an event without team leader', async () => {
      req.params.modelType = 'event';
      req.params.id = 'event123';
      
      const mockEvent = {
        _id: 'event123',
        title: 'Test Event',
        status: 'suspended',
        createdBy: 'team123'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockEvent);
      Event.findByIdAndUpdate.mockReturnValue({ select: mockSelect });
      
      const mockTeamSelect = jest.fn().mockResolvedValue(null);
      Team.findById.mockReturnValue({ select: mockTeamSelect });

      await toggleSuspension(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should suspend an ad and notify sponsor', async () => {
      req.params.modelType = 'ad';
      req.params.id = 'ad123';
      
      const mockAd = {
        _id: 'ad123',
        title: 'Test Ad',
        status: 'Suspended',
        sponsorId: 'sponsor123'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockAd);
      SponsorAd.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await toggleSuspension(req, res);

      expect(SponsorAd.findByIdAndUpdate).toHaveBeenCalledWith(
        'ad123',
        { status: 'Suspended' },
        { new: true, runValidators: true }
      );
      expect(mockInboxEntitySave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should activate an ad', async () => {
      req.params.modelType = 'ad';
      req.params.id = 'ad123';
      req.body.targetStatus = 'active';
      
      const mockAd = {
        _id: 'ad123',
        title: 'Test Ad',
        status: 'Published',
        sponsorId: 'sponsor123'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockAd);
      SponsorAd.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await toggleSuspension(req, res);

      expect(SponsorAd.findByIdAndUpdate).toHaveBeenCalledWith(
        'ad123',
        { status: 'Published' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid model type', async () => {
      req.params.modelType = 'invalid';

      await toggleSuspension(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid model type or targetStatus specified.'
      });
    });

    it('should return 400 for invalid targetStatus', async () => {
      req.body.targetStatus = 'invalid';

      await toggleSuspension(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid model type or targetStatus specified.'
      });
    });

    it('should return 404 if entity not found', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await toggleSuspension(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'user with ID user123 not found.'
      });
    });

    it('should return 400 for invalid ID format (CastError)', async () => {
      const mockSelect = jest.fn().mockRejectedValue({ name: 'CastError' });
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await toggleSuspension(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid ID format.'
      });
    });

    it('should return 500 on server error', async () => {
      const mockSelect = jest.fn().mockRejectedValue(new Error('Database error'));
      User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

      await toggleSuspension(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error.',
        error: 'Database error'
      });
    });

    it('should handle event with no name or title', async () => {
      req.params.modelType = 'event';
      req.params.id = 'event123';
      
      const mockEvent = {
        _id: 'event123',
        status: 'suspended',
        createdBy: 'team123'
      };

      const mockSelect = jest.fn().mockResolvedValue(mockEvent);
      Event.findByIdAndUpdate.mockReturnValue({ select: mockSelect });
      
      const mockTeamSelect = jest.fn().mockResolvedValue({ leader: 'leader123' });
      Team.findById.mockReturnValue({ select: mockTeamSelect });

      await toggleSuspension(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockInboxEntitySave).toHaveBeenCalled();
    });
  });

  describe('createReport', () => {
    let mockInboxEntitySave;

    beforeEach(() => {
      req.params = { modelType: 'event', id: 'event123' };
      req.body = { reason: 'Inappropriate content' };

      mockInboxEntitySave = Inbox.prototype.save;
      
      // Create proper mock ObjectIds with equals method
      const createMockObjectId = (id) => ({
        equals: jest.fn((other) => other === id || (typeof other === 'object' && other.toString() === id)),
        toString: () => id
      });
      
      mockAdminUsers = [
        { _id: createMockObjectId('admin1') },
        { _id: createMockObjectId('admin2') }
      ];

      const mockAdminSelect = jest.fn().mockResolvedValue(mockAdminUsers);
      User.find.mockReturnValue({ select: mockAdminSelect });

      // Reset findById mocks
      User.findById = jest.fn();
      Event.findById = jest.fn();
      SponsorAd.findById = jest.fn();
      Team.findById = jest.fn();

      // Clear previous mock calls
      mockModel.mockClear();
      
      mockModel.mockImplementation((modelName) => {
        if (modelName === 'User') return User;
        if (modelName === 'Event') return Event;
        if (modelName === 'SponsorAd') return SponsorAd;
        if (modelName === 'InboxEntity') return InboxEntityConstructor;
        return null;
      });
    });

    it('should return 400 if reason is not provided', async () => {
      req.body.reason = '';

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'A reason for the report is required.'
      });
    });

    it('should return 400 for invalid model type', async () => {
      req.params.modelType = 'invalid';

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid model type for reporting.'
      });
    });

    it('should return 404 if reported entity not found', async () => {
      Event.findById.mockResolvedValue(null);

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'The reported event was not found.'
      });
    });

    it('should create report for event and notify admins and team leader', async () => {
      const mockEvent = {
        _id: 'event123',
        title: 'Test Event',
        createdBy: 'team123'
      };

      Event.findById.mockResolvedValue(mockEvent);
      
      const mockTeamSelect = jest.fn().mockResolvedValue({ leader: 'leader123' });
      Team.findById.mockReturnValue({ select: mockTeamSelect });

      await createReport(req, res);

      expect(Event.findById).toHaveBeenCalledWith('event123');
      expect(Team.findById).toHaveBeenCalledWith('team123');
      expect(Inbox.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.message).toBe('Report filed successfully. Admin and Team Leader have been notified.');
      expect(responseCall.reportId).toBeDefined();
    });

    it('should create report for event without team leader', async () => {
      const mockEvent = {
        _id: 'event123',
        title: 'Test Event',
        createdBy: 'team123'
      };

      Event.findById.mockResolvedValue(mockEvent);
      const mockTeamSelect = jest.fn().mockResolvedValue(null);
      Team.findById.mockReturnValue({ select: mockTeamSelect });
      Inbox.prototype.save.mockResolvedValue({ _id: 'report123' });

      await createReport(req, res);

      expect(Inbox.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.message).toBe('Report filed successfully. Admins have been notified.');
      expect(responseCall.reportId).toBeDefined();
    });

    it('should create report for ad and notify admins and sponsor', async () => {
      req.params.modelType = 'ad';
      req.params.id = 'ad123';
      req.body.reason = 'Inappropriate content';

      const mockAd = {
        _id: 'ad123',
        adName: 'Test Ad',
        sponsorId: 'sponsor123'
      };
      SponsorAd.findById.mockResolvedValue(mockAd);
      Inbox.prototype.save.mockResolvedValue({ _id: 'report123' });

      await createReport(req, res);

      expect(SponsorAd.findById).toHaveBeenCalledWith('ad123');
      expect(Inbox.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.message).toBe('Report filed successfully. Admin and Sponsor have been notified.');
      expect(responseCall.reportId).toBeDefined();
    });

    it('should create report for user and notify admins and user', async () => {
      req.params.modelType = 'user';
      req.params.id = 'user123';
      req.body.reason = 'Inappropriate content';

      const mockUser = {
        _id: 'user123',
        name: 'Test User'
      };
      User.findById.mockResolvedValue(mockUser);
      Inbox.prototype.save.mockResolvedValue({ _id: 'report123' });

      await createReport(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Inbox.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.message).toBe('Report filed successfully. Admin and User have been notified.');
      expect(responseCall.reportId).toBeDefined();
    });

    it('should handle entity without name or title', async () => {
      const mockEvent = {
        _id: 'event123',
        createdBy: 'team123'
      };

      Event.findById.mockResolvedValue(mockEvent);
      
      const mockTeamSelect = jest.fn().mockResolvedValue({ leader: 'leader123' });
      Team.findById.mockReturnValue({ select: mockTeamSelect });

      await createReport(req, res);

      expect(Inbox.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.message).toBe('Report filed successfully. Admin and Team Leader have been notified.');
      expect(responseCall.reportId).toBeDefined();
    });

    it('should not duplicate admin ID in recipients', async () => {
      const mockEvent = {
        _id: 'event123',
        title: 'Test Event',
        createdBy: 'team123'
      };

      Event.findById.mockResolvedValue(mockEvent);
      
      // Team leader is also an admin
      const mockTeamSelect = jest.fn().mockResolvedValue({ leader: 'admin1' });
      Team.findById.mockReturnValue({ select: mockTeamSelect });

      // Mock ObjectId.equals method - create actual object ID with equals method
      mockAdminUsers[0]._id = {
        equals: jest.fn().mockReturnValue(true)
      };

      await createReport(req, res);

      expect(Inbox.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 for invalid ID format (CastError)', async () => {
      Event.findById.mockRejectedValue({ name: 'CastError' });

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid ID format provided.'
      });
    });

    it('should return 500 on server error', async () => {
      Event.findById.mockRejectedValue(new Error('Database error'));

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error.',
        error: 'Database error'
      });
    });

    it('should log report creation in console', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const mockEvent = {
        _id: 'event123',
        title: 'Test Event',
        createdBy: 'team123'
      };

      Event.findById.mockResolvedValue(mockEvent);
      
      const mockTeamSelect = jest.fn().mockResolvedValue({ leader: 'leader123' });
      Team.findById.mockReturnValue({ select: mockTeamSelect });

      await createReport(req, res);

      expect(consoleLogSpy).toHaveBeenCalledWith('New Report:', expect.any(Object));
      
      consoleLogSpy.mockRestore();
    });
  });
});
