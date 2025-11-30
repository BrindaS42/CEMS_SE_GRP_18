import { jest } from '@jest/globals';
import {
  createDraft,
  editDraft,
  deleteDraft,
  getListOfDrafts,
  sendMessage,
  sendDirectMessage,
  getListOfSents,
  getListOfArrivals,
  approveInboxEntity,
  rejectInboxEntity
} from '../../controllers/inbox.controller.js';
import InboxEntity from '../../models/inbox.model.js';
import Event from '../../models/event.model.js';
import Team from '../../models/organizerTeam.model.js';
import StudentTeam from '../../models/studentTeam.model.js';
import Registration from '../../models/registration.model.js';
import User from '../../models/user.model.js';
import College from '../../models/college.model.js';

// --- MOCKS ---
jest.mock('../../models/inbox.model.js');
jest.mock('../../models/event.model.js');
jest.mock('../../models/event.model.js');
jest.mock('../../models/organizerTeam.model.js');
jest.mock('../../models/studentTeam.model.js');
jest.mock('../../models/registration.model.js');
jest.mock('../../models/user.model.js');
jest.mock('../../models/college.model.js');

describe('Inbox Controller', () => {
  let req, res;

  // beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  // afterAll(() => console.error.mockRestore());
  beforeAll(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterAll(() => console.log.mockRestore());
  beforeAll(() => jest.spyOn(console, 'warn').mockImplementation(() => {}));
  afterAll(() => console.warn.mockRestore());

  beforeEach(() => {
    req = {
      user: { id: 'user123', role: 'student' },
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // --- createDraft ---
  describe('createDraft', () => {
    it('should create a draft successfully with valid inputs', async () => {
      req.body = {
        type: 'announcement',
        title: 'Test Title',
        description: 'Test Description',
        to: [{ email: 'test@example.com', role: 'student' }],
        relatedEvent: 'event123',
        relatedTeam: 'team123',
        relatedTeamModel: 'Team'
      };

      const mockUser = { _id: 'recipientId' };
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockUser)
        })
      });

      const mockDraft = { _id: 'draft123', ...req.body, from: 'user123', to: ['recipientId'], status: 'Draft' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);

      const mockPopulatedDraft = {
        ...mockDraft,
        from: { email: 'user@example.com', profile: { name: 'User' } },
        to: [{ email: 'test@example.com', profile: { name: 'Test' } }]
      };
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      // The second populate call should resolve to the final document
      mockQuery.populate.mockReturnValueOnce(mockQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith({
        type: 'announcement',
        title: 'Test Title',
        description: 'Test Description',
        from: 'user123',
        to: ['recipientId'],
        relatedEvent: 'event123',
        relatedTeam: 'team123',
        relatedTeamModel: 'Team',
        status: 'Draft'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Draft created successfully',
        data: mockPopulatedDraft
      });
    });

    it('should return 400 if type is missing', async () => {
      req.body = { title: 'Test Title' };

      await createDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Type and title are required' });
    });

    it('should return 400 if title is missing', async () => {
      req.body = { type: 'message' };

      await createDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Type and title are required' });
    });

    it('should handle broadcast keyword for admin - to_allusers', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'Broadcast',
        to: ['to_allusers']
      };

      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      const mockDraft = { _id: 'draft123', status: 'Draft' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);

      const mockPopulatedDraft = { ...mockDraft };
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(User.find).toHaveBeenCalledWith();
      expect(mockQuery.select).toHaveBeenCalledWith('_id');
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['user1', 'user2']
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle broadcast keyword for admin - to_all_student', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'Students Only',
        to: ['to_all_student']
      };

      const mockUsers = [{ _id: 'student1' }, { _id: 'student2' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      InboxEntity.create = jest.fn().mockResolvedValue({ _id: 'draft123' });
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'student' });
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['student1', 'student2']
      }));
    });

    it('should handle broadcast keyword for admin - to_all_organizer', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'Organizers Only',
        to: ['to_all_organizer']
      };

      const mockUsers = [{ _id: 'org1' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      InboxEntity.create = jest.fn().mockResolvedValue({ _id: 'draft123' });
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'organizer' });
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['org1']
      }));
    });

    it('should handle broadcast keyword for admin - to_all_sponsor', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'Sponsors Only',
        to: ['to_all_sponsor']
      };

      const mockUsers = [{ _id: 'sponsor1' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      InboxEntity.create = jest.fn().mockResolvedValue({ _id: 'draft123' });
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(User.find).toHaveBeenCalledWith({ role: 'sponsor' });
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['sponsor1']
      }));
    });

    it('should handle broadcast keyword to_college for admin', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'College Announcement',
        to: ['to_college:MIT']
      };

      const mockCollege = { _id: 'college123', name: 'MIT' };
      College.findOne = jest.fn().mockResolvedValue(mockCollege);

      const mockUsers = [{ _id: 'student1' }, { _id: 'student2' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      InboxEntity.create = jest.fn().mockResolvedValue({ _id: 'draft123' });
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(College.findOne).toHaveBeenCalledWith({ name: 'MIT' });
      expect(User.find).toHaveBeenCalledWith({ college: 'college123' });
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['student1', 'student2']
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle error when college not found', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'College Announcement',
        to: ['to_college:NonExistent']
      };

      College.findOne = jest.fn().mockResolvedValue(null);

      await createDraft(req, res);

      expect(College.findOne).toHaveBeenCalledWith({ name: 'NonExistent' });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to create draft' });
    });

    it('should handle non-broadcast string in to array for non-admin', async () => {
      req.user.role = 'student';
      req.body = {
        type: 'message',
        title: 'Test',
        to: ['random_string']
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      InboxEntity.create = jest.fn().mockResolvedValue({ _id: 'draft123' });
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(User.find).not.toHaveBeenCalled();
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: []
      }));
    });

    it('should handle empty to array', async () => {
      req.body = {
        type: 'message',
        title: 'Test',
        to: []
      };

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: []
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle non-existent users gracefully', async () => {
      req.body = {
        type: 'message',
        title: 'Test',
        to: [{ email: 'nonexistent@example.com', role: 'student' }]
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: []
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle undefined to field', async () => {
      req.body = {
        type: 'message',
        title: 'Test'
      };

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: []
      }));
    });

    it('should handle non-array to field', async () => {
      req.body = {
        type: 'message',
        title: 'Test',
        to: 'notanarray'
      };

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: []
      }));
    });

    it('should not allow non-admin to use broadcast keywords', async () => {
      req.user.role = 'student';
      req.body = {
        type: 'message',
        title: 'Test',
        to: ['to_allusers']
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(User.find).not.toHaveBeenCalled();
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: []
      }));
    });

    it('should handle database error', async () => {
      req.body = {
        type: 'message',
        title: 'Test'
      };

      InboxEntity.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await createDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to create draft' });
    });

    it('should handle undefined req.user', async () => {
      req.user = undefined;
      req.body = {
        type: 'message',
        title: 'Test'
      };

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        from: undefined
      }));
    });

    it('should handle undefined req.user.id', async () => {
      req.user = { role: 'student' };
      req.body = {
        type: 'message',
        title: 'Test'
      };

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        from: undefined
      }));
    });

    it('should handle object recipients in to array', async () => {
      req.body = {
        type: 'message',
        title: 'Test',
        to: [{ email: 'test@example.com', role: 'student' }, { email: 'test2@example.com', role: 'organizer' }]
      };

      User.findOne = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ _id: 'user1' })
          })
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ _id: 'user2' })
          })
        });

      const mockDraft = { _id: 'draft123' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockDraft);
      
      const mockPopulatedDraft = { _id: 'draft123', status: 'Draft' };
      const mockPopQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedDraft);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await createDraft(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['user1', 'user2']
      }));
    });
  });

  // --- editDraft ---
  describe('editDraft', () => {
    it('should edit a draft successfully', async () => {
      req.params.draftId = 'draft123';
      req.body = {
        type: 'announcement',
        title: 'Updated Title',
        description: 'Updated Description',
        to: [{ email: 'new@example.com', role: 'student' }]
      };

      const mockDraft = {
        _id: 'draft123',
        from: { toString: () => 'user123' },
        to: ['oldRecipient'],
        status: 'Draft',
        type: 'message',
        title: 'Old Title'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: 'newRecipient' })
        })
      });

      const mockUpdated = { ...mockDraft, ...req.body, to: ['newRecipient'] };
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockQuery.populate.mockReturnValueOnce(mockQuery).mockResolvedValueOnce(mockUpdated);
      InboxEntity.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      await editDraft(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith(
        'draft123',
        expect.objectContaining({
          type: 'announcement',
          title: 'Updated Title',
          description: 'Updated Description',
          to: ['newRecipient']
        }),
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Draft updated successfully',
        data: mockUpdated
      });
    });

    it('should return 404 if draft not found', async () => {
      req.params.draftId = 'nonexistent';
      req.body = { title: 'Test' };

      InboxEntity.findById = jest.fn().mockResolvedValue(null);

      await editDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Draft not found' });
    });

    it('should return 403 if user is not the owner', async () => {
      req.params.draftId = 'draft123';
      req.body = { title: 'Test' };

      const mockDraft = {
        _id: 'draft123',
        from: 'otherUser',
        status: 'Draft'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      await editDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized to edit this draft' });
    });

    it('should return 400 if draft status is not Draft', async () => {
      req.params.draftId = 'draft123';
      req.body = { title: 'Test' };

      const mockDraft = {
        _id: 'draft123',
        from: 'user123',
        status: 'Sent'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      await editDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Only drafts can be edited' });
    });

    it('should handle broadcast keyword for admin in edit', async () => {
      req.user.role = 'admin';
      req.params.draftId = 'draft123';
      req.body = {
        to: ['to_allusers']
      };

      const mockDraft = {
        _id: 'draft123',
        from: 'user123',
        to: [],
        status: 'Draft',
        type: 'message',
        title: 'Test'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findByIdAndUpdate = jest.fn().mockReturnValue(mockPopQuery);

      await editDraft(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith(
        'draft123',
        expect.objectContaining({
          to: ['user1', 'user2']
        }),
        { new: true, runValidators: true }
      );
    });

    it('should keep existing values if not provided in update', async () => {
      req.params.draftId = 'draft123';
      req.body = { title: 'New Title Only' };

      const mockDraft = {
        _id: 'draft123',
        from: 'user123',
        to: ['recipient1'],
        status: 'Draft',
        type: 'announcement',
        title: 'Old Title',
        description: 'Old Desc',
        relatedEvent: 'event123'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findByIdAndUpdate = jest.fn().mockReturnValue(mockPopQuery);

      await editDraft(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith(
        'draft123',
        expect.objectContaining({
          type: 'announcement',
          title: 'New Title Only',
          description: 'Old Desc',
          relatedEvent: 'event123'
        }),
        { new: true, runValidators: true }
      );
    });

    it('should handle empty to array in update', async () => {
      req.params.draftId = 'draft123';
      req.body = { to: [] };

      const mockDraft = {
        _id: 'draft123',
        from: 'user123',
        to: ['oldRecipient'],
        status: 'Draft',
        type: 'message',
        title: 'Test'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findByIdAndUpdate = jest.fn().mockReturnValue(mockPopQuery);

      await editDraft(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith(
        'draft123',
        expect.objectContaining({
          to: ['oldRecipient']
        }),
        { new: true, runValidators: true }
      );
    });

    it('should handle database error', async () => {
      req.params.draftId = 'draft123';
      req.body = { title: 'Test' };

      InboxEntity.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await editDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to update draft' });
    });

    it('should handle some recipients not found', async () => {
      req.params.draftId = 'draft123';
      req.body = {
        to: [
          { email: 'exists@example.com', role: 'student' },
          { email: 'notexist@example.com', role: 'student' }
        ]
      };

      const mockDraft = {
        _id: 'draft123',
        from: 'user123',
        to: [],
        status: 'Draft',
        type: 'message',
        title: 'Test'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      User.findOne = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ _id: 'foundUser' })
          })
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
          })
        });

      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findByIdAndUpdate = jest.fn().mockReturnValue(mockPopQuery);

      await editDraft(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith(
        'draft123',
        expect.objectContaining({
          to: ['foundUser']
        }),
        { new: true, runValidators: true }
      );
    });
  });

  // --- deleteDraft ---
  describe('deleteDraft', () => {
    it('should delete a draft successfully', async () => {
      req.params.draftId = 'draft123';

      const mockDraft = {
        _id: 'draft123',
        from: 'user123'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);
      InboxEntity.findByIdAndDelete = jest.fn().mockResolvedValue(mockDraft);

      await deleteDraft(req, res);

      expect(InboxEntity.findByIdAndDelete).toHaveBeenCalledWith('draft123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Draft deleted successfully'
      });
    });

    it('should return 404 if draft not found', async () => {
      req.params.draftId = 'nonexistent';

      InboxEntity.findById = jest.fn().mockResolvedValue(null);

      await deleteDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Draft not found' });
    });

    it('should return 403 if user is not the owner', async () => {
      req.params.draftId = 'draft123';

      const mockDraft = {
        _id: 'draft123',
        from: 'otherUser'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      await deleteDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
    });

    it('should handle database error', async () => {
      req.params.draftId = 'draft123';

      InboxEntity.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await deleteDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to delete draft' });
    });

    it('should handle undefined req.user', async () => {
      req.user = undefined;
      req.params.draftId = 'draft123';

      const mockDraft = {
        _id: 'draft123',
        from: 'someUser'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      await deleteDraft(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // --- getListOfDrafts ---
  describe('getListOfDrafts', () => {
    it('should return list of drafts successfully', async () => {
      const mockDrafts = [
        { _id: 'draft1', title: 'Draft 1', status: 'Draft' },
        { _id: 'draft2', title: 'Draft 2', status: 'Draft' }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockDrafts)
      };
      InboxEntity.find = jest.fn().mockReturnValue(mockQuery);

      await getListOfDrafts(req, res);

      expect(InboxEntity.find).toHaveBeenCalledWith({ from: 'user123', status: 'Draft' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockDrafts
      });
    });

    it('should return empty array when no drafts', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      InboxEntity.find = jest.fn().mockReturnValue(mockQuery);

      await getListOfDrafts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should handle database error', async () => {
      InboxEntity.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getListOfDrafts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to fetch drafts' });
    });

    it('should handle undefined req.user', async () => {
      req.user = undefined;

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      InboxEntity.find = jest.fn().mockReturnValue(mockQuery);

      await getListOfDrafts(req, res);

      expect(InboxEntity.find).toHaveBeenCalledWith({ from: undefined, status: 'Draft' });
    });
  });

  // --- sendMessage ---
  describe('sendMessage', () => {
    it('should send a draft message successfully', async () => {
      req.params.draftId = 'draft123';
      req.body = { to: ['recipient1', 'recipient2'] };

      const mockDraft = {
        _id: 'draft123',
        from: { toString: () => 'user123' },
        to: ['recipient1', 'recipient2'],
        title: 'Test Message',
        status: 'Draft'
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      const mockSentMessage = { ...mockDraft, status: 'Sent' };
      const mockQuery = {
        populate: jest.fn().mockReturnThis()
      };
      mockQuery.populate
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce(mockSentMessage);
      InboxEntity.findByIdAndUpdate = jest.fn().mockReturnValue(mockQuery);

      await sendMessage(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith(
        'draft123',
        { status: 'Sent', to: ['recipient1', 'recipient2'] },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Message sent successfully',
        data: mockSentMessage
      });
    });

    it('should return 404 if message not found', async () => {
      req.params.draftId = 'nonexistent';
      req.body = { to: ['recipient1'] };

      InboxEntity.findById = jest.fn().mockResolvedValue(null);

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Message not found' });
    });

    it('should return 403 if user is not the owner', async () => {
      req.params.draftId = 'draft123';
      req.body = { to: ['recipient1'] };

      const mockDraft = {
        _id: 'draft123',
        from: { toString: () => 'otherUser' }
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
    });

    it('should return 400 if recipients are missing', async () => {
      req.params.draftId = 'draft123';
      req.body = { to: [] };

      const mockDraft = {
        _id: 'draft123',
        from: { toString: () => 'user123' }
      };
      InboxEntity.findById = jest.fn().mockResolvedValue(mockDraft);

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipients are required' });
    });

    it('should handle database error', async () => {
      req.params.draftId = 'draft123';
      req.body = { to: ['recipient1'] };

      InboxEntity.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await sendMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to send message' });
    });
  });

  // --- sendDirectMessage ---
  describe('sendDirectMessage', () => {
    it('should send a direct message successfully', async () => {
      req.body = {
        type: 'message',
        title: 'Direct Message',
        description: 'Test description',
        to: [{ email: 'test@example.com', role: 'student' }]
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: 'recipient1' })
        })
      });

      const mockMessage = { _id: 'message123', status: 'Sent' };
      InboxEntity.create = jest.fn().mockResolvedValue(mockMessage);

      const mockPopulatedMessage = { ...mockMessage, from: { email: 'user@example.com' } };
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce(mockPopulatedMessage);
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await sendDirectMessage(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'message',
        title: 'Direct Message',
        status: 'Sent',
        to: ['recipient1']
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Message sent successfully',
        data: mockPopulatedMessage
      });
    });

    it('should return 400 if type is missing', async () => {
      req.body = { title: 'Test', to: [{ email: 'test@example.com', role: 'student' }] };

      await sendDirectMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Type and title are required' });
    });

    it('should return 400 if title is missing', async () => {
      req.body = { type: 'message', to: [{ email: 'test@example.com', role: 'student' }] };

      await sendDirectMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Type and title are required' });
    });

    it('should return 400 if recipients are missing', async () => {
      req.body = { type: 'message', title: 'Test', to: [] };

      await sendDirectMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Recipients required' });
    });

    it('should handle broadcast keyword for admin', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'Broadcast',
        to: ['to_allusers']
      };

      const mockUsers = [{ _id: 'user1' }, { _id: 'user2' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      InboxEntity.create = jest.fn().mockResolvedValue({ _id: 'message123' });
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await sendDirectMessage(req, res);

      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['user1', 'user2'],
        status: 'Sent'
      }));
    });

    it('should handle to_college keyword for admin', async () => {
      req.user.role = 'admin';
      req.body = {
        type: 'announcement',
        title: 'College Message',
        to: ['to_college:Stanford']
      };

      const mockCollege = { _id: 'college456', name: 'Stanford' };
      College.findOne = jest.fn().mockResolvedValue(mockCollege);

      const mockUsers = [{ _id: 'student1' }];
      const mockQuery = { select: jest.fn().mockResolvedValue(mockUsers) };
      User.find = jest.fn().mockReturnValue(mockQuery);

      InboxEntity.create = jest.fn().mockResolvedValue({ _id: 'message123' });
      const mockPopQuery = { populate: jest.fn().mockReturnThis() };
      mockPopQuery.populate.mockReturnValueOnce(mockPopQuery).mockResolvedValueOnce({});
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await sendDirectMessage(req, res);

      expect(College.findOne).toHaveBeenCalledWith({ name: 'Stanford' });
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        to: ['student1'],
        status: 'Sent'
      }));
    });

    it('should handle database error', async () => {
      req.body = {
        type: 'message',
        title: 'Test',
        to: [{ email: 'test@example.com', role: 'student' }]
      };

      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: 'recipient1' })
        })
      });

      InboxEntity.create = jest.fn().mockRejectedValue(new Error('Database error'));

      await sendDirectMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to send message' });
    });
  });

  // --- getListOfSents ---
  describe('getListOfSents', () => {
    it('should return list of sent messages successfully', async () => {
      const mockSentMessages = [
        { _id: 'sent1', title: 'Message 1', status: 'Sent' },
        { _id: 'sent2', title: 'Message 2', status: 'Approved' }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockSentMessages)
      };
      InboxEntity.find = jest.fn().mockReturnValue(mockQuery);

      await getListOfSents(req, res);

      expect(InboxEntity.find).toHaveBeenCalledWith({
        from: 'user123',
        status: { $in: ['Sent', 'Approved', 'Rejected', 'Pending'] }
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockSentMessages
      });
    });

    it('should return empty array when no sent messages', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      InboxEntity.find = jest.fn().mockReturnValue(mockQuery);

      await getListOfSents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should handle database error', async () => {
      InboxEntity.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getListOfSents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to fetch sent messages' });
    });
  });

  // --- getListOfArrivals ---
  describe('getListOfArrivals', () => {
    it('should return list of arrival messages successfully', async () => {
      const mockArrivals = [
        { _id: 'arrival1', title: 'Incoming 1', status: 'Sent' },
        { _id: 'arrival2', title: 'Incoming 2', status: 'Sent' }
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockArrivals)
      };
      InboxEntity.find = jest.fn().mockReturnValue(mockQuery);

      await getListOfArrivals(req, res);

      expect(InboxEntity.find).toHaveBeenCalledWith({ to: { $in: ['user123'] } });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockArrivals
      });
    });

    it('should return empty array when no arrivals', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([])
      };
      InboxEntity.find = jest.fn().mockReturnValue(mockQuery);

      await getListOfArrivals(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 0,
        data: []
      });
    });

    it('should handle database error', async () => {
      InboxEntity.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await getListOfArrivals(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Failed to fetch arrival messages' });
    });
  });

  // --- approveInboxEntity ---
  describe('approveInboxEntity', () => {
    it('should approve a message successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'message',
        status: 'Sent'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Approved' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'message approved successfully'
      });
    });

    it('should approve an announcement successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'announcement',
        status: 'Sent'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Approved' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'announcement approved successfully'
      });
    });

    it('should approve subevent_invite successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'subevent_invite',
        to: 'user123',
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockTeam = { _id: 'team123', leader: 'user123' };
      Team.findOne = jest.fn().mockResolvedValue(mockTeam);

      const mockSubevent = { _id: 'subevent123', createdBy: 'team123' };
      Event.findOne = jest.fn().mockResolvedValue(mockSubevent);

      const mockMainEvent = {
        _id: 'event123',
        subEvents: [],
        save: jest.fn().mockResolvedValue(true)
      };
      Event.findById = jest.fn().mockResolvedValue(mockMainEvent);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockMainEvent.save).toHaveBeenCalled();
      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Approved' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Subevent invitation approved successfully',
        data: expect.objectContaining({
          mainEventId: 'event123',
          subeventId: 'subevent123'
        })
      });
    });

    it('should approve subevent_invite when subevent already exists', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'subevent_invite',
        to: 'user123',
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockTeam = { _id: 'team123', leader: 'user123', name: 'Test Team' };
      Team.findOne = jest.fn().mockResolvedValue(mockTeam);

      const mockSubevent = { _id: 'subevent123', createdBy: 'team123' };
      Event.findOne = jest.fn().mockResolvedValue(mockSubevent);

      const mockMainEvent = {
        _id: 'event123',
        subEvents: [{ subevent: 'subevent123', status: 'Pending' }],
        save: jest.fn().mockResolvedValue(true)
      };
      Event.findById = jest.fn().mockResolvedValue(mockMainEvent);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockMainEvent.subEvents[0].status).toBe('Approved');
      expect(mockMainEvent.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if team not found for subevent_invite', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'subevent_invite',
        to: 'user123',
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      Team.findOne = jest.fn().mockResolvedValue(null);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No team found where recipient is leader' });
    });

    it('should return 404 if event not found for subevent_invite', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'subevent_invite',
        to: 'user123',
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockTeam = { _id: 'team123', leader: 'user123' };
      Team.findOne = jest.fn().mockResolvedValue(mockTeam);
      Event.findOne = jest.fn().mockResolvedValue(null);
      Event.findById = jest.fn().mockResolvedValue(null);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('should approve sponsorship_request successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'sponsorship_request',
        to: ['sponsor123'],
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockEvent = {
        _id: 'event123',
        sponsors: [{ sponsor: 'sponsor123', status: 'Pending' }],
        save: jest.fn().mockResolvedValue(true)
      };
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockEvent.sponsors[0].status).toBe('Approved');
      expect(mockEvent.save).toHaveBeenCalled();
      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Approved' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Sponsorship request approved successfully',
        event: mockEvent
      });
    });

    it('should add sponsor if not in list (sponsorship_request fallback)', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'sponsorship_request',
        to: ['newsponsor123'],
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockEvent = {
        _id: 'event123',
        sponsors: [{ sponsor: 'othersponsor', status: 'Approved' }],
        save: jest.fn().mockResolvedValue(true)
      };
      Event.findById = jest.fn().mockResolvedValue(mockEvent);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockEvent.sponsors.length).toBe(2);
      expect(mockEvent.sponsors[1]).toEqual({ sponsor: 'newsponsor123', status: 'Approved' });
      expect(mockEvent.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if event not found for sponsorship_request', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'sponsorship_request',
        to: ['sponsor123'],
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      Event.findById = jest.fn().mockResolvedValue(null);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found for sponsorship request' });
    });

    it('should approve team_invite for StudentTeam successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['member123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'StudentTeam'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockTeam = {
        _id: 'team123',
        teamName: 'Student Team',
        members: [{ member: 'member123', status: 'Pending' }],
        save: jest.fn().mockResolvedValue(true)
      };
      StudentTeam.findById = jest.fn().mockResolvedValue(mockTeam);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockTeam.members[0].status).toBe('Approved');
      expect(mockTeam.save).toHaveBeenCalled();
      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Approved' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully joined the student team',
        data: expect.objectContaining({
          teamId: 'team123'
        })
      });
    });

    it('should add member if not in StudentTeam list (fallback)', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['newmember123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'StudentTeam'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockTeam = {
        _id: 'team123',
        teamName: 'Student Team',
        members: [{ member: 'existingmember', status: 'Approved' }],
        save: jest.fn().mockResolvedValue(true)
      };
      StudentTeam.findById = jest.fn().mockResolvedValue(mockTeam);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockTeam.members.length).toBe(2);
      expect(mockTeam.members[1]).toEqual({ member: 'newmember123', status: 'Approved' });
      expect(mockTeam.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if StudentTeam not found for team_invite', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['member123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'StudentTeam'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      StudentTeam.findById = jest.fn().mockResolvedValue(null);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Student Team not found' });
    });

    it('should approve team_invite for Team (organizer) successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['member123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'Team',
        role: 'volunteer'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockTeam = {
        _id: 'team123',
        name: 'Organizer Team',
        members: [{ user: 'member123', status: 'Pending', role: 'volunteer' }],
        save: jest.fn().mockResolvedValue(true)
      };
      Team.findById = jest.fn().mockResolvedValue(mockTeam);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockTeam.members[0].status).toBe('Approved');
      expect(mockTeam.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully joined the organizer team',
        data: expect.objectContaining({
          teamId: 'team123'
        })
      });
    });

    it('should add member if not in Team list (fallback)', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['newmember123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'Team',
        role: 'volunteer'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockTeam = {
        _id: 'team123',
        name: 'Organizer Team',
        members: [{ user: 'existingmember', status: 'Approved', role: 'leader' }],
        save: jest.fn().mockResolvedValue(true)
      };
      Team.findById = jest.fn().mockResolvedValue(mockTeam);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(mockTeam.members.length).toBe(2);
      expect(mockTeam.members[1]).toEqual({ user: 'newmember123', role: 'volunteer', status: 'Approved' });
      expect(mockTeam.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if Team not found for team_invite', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['member123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'Team'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      Team.findById = jest.fn().mockResolvedValue(null);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Organizer Team not found' });
    });

    it('should return 400 for invalid team model', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['member123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'InvalidModel'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid team model for team invite.' });
    });

    it('should approve registration_approval_request successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'registration_approval_request',
        from: 'student123',
        to: 'organizer123',
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      const mockRegistration = {
        _id: 'reg123',
        studentId: 'student123',
        eventId: 'event123',
        paymentStatus: 'pending',
        status: 'pending',
        checkInCode: 'ABC123',
        save: jest.fn().mockResolvedValue(true)
      };
      Registration.findOne = jest.fn().mockResolvedValue(mockRegistration);

      const mockEvent = { _id: 'event123', title: 'Test Event' };
      Event.findById = jest.fn().mockResolvedValue(mockEvent);

      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });
      InboxEntity.create = jest.fn().mockResolvedValue({});

      await approveInboxEntity(req, res);

      expect(mockRegistration.paymentStatus).toBe('verified');
      expect(mockRegistration.status).toBe('confirmed');
      expect(mockRegistration.save).toHaveBeenCalled();
      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Approved' });
      expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'message',
        from: 'organizer123',
        to: 'student123',
        status: 'Sent'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration approved successfully',
        data: mockRegistration
      });
    });

    it('should return 404 if registration not found', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'registration_approval_request',
        from: 'student123',
        relatedEvent: 'event123'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      Registration.findOne = jest.fn().mockResolvedValue(null);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No registration found' });
    });

    it('should approve unknown inbox type with default handler', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'custom_type',
        status: 'Sent'
      };
      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(mockInbox) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Approved' });

      await approveInboxEntity(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Approved' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'custom_type approved successfully'
      });
    });

    it('should return 404 if inbox item not found', async () => {
      req.params.id = 'nonexistent';

      const mockPopQuery = { populate: jest.fn().mockReturnThis(), lean: jest.fn().mockResolvedValue(null) };
      InboxEntity.findById = jest.fn().mockReturnValue(mockPopQuery);

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Inbox item not found' });
    });

    it('should handle database error', async () => {
      req.params.id = 'inbox123';

      InboxEntity.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await approveInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to approve inbox',
        error: 'Database error'
      });
    });
  });

  // --- rejectInboxEntity ---
  describe('rejectInboxEntity', () => {
    it('should reject a message successfully', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'message',
        status: 'Sent'
      };
      InboxEntity.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInbox)
      });
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Rejected' });

      await rejectInboxEntity(req, res);

      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Rejected' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'message rejected successfully',
        data: { id: 'inbox123', type: 'message' }
      });
    });

    it('should return 404 if inbox item not found', async () => {
      req.params.id = 'nonexistent';

      InboxEntity.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      await rejectInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Inbox item not found' });
    });

    it('should handle team invite rejection for StudentTeam', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['member123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'StudentTeam'
      };
      InboxEntity.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInbox)
      });
      StudentTeam.findByIdAndUpdate = jest.fn().mockResolvedValue({});
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Rejected' });

      await rejectInboxEntity(req, res);

      expect(StudentTeam.findByIdAndUpdate).toHaveBeenCalledWith('team123', {
        $pull: { members: { member: 'member123' } }
      });
      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Rejected' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle team invite rejection for Team (organizer)', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'team_invite',
        to: ['member123'],
        relatedTeam: 'team123',
        relatedTeamModel: 'Team'
      };
      InboxEntity.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInbox)
      });
      Team.findByIdAndUpdate = jest.fn().mockResolvedValue({});
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Rejected' });

      await rejectInboxEntity(req, res);

      expect(Team.findByIdAndUpdate).toHaveBeenCalledWith('team123', {
        $pull: { members: { user: 'member123' } }
      });
      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Rejected' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'team_invite rejected successfully',
        data: { id: 'inbox123', type: 'team_invite' }
      });
    });

    it('should reject non-team_invite types without pulling members', async () => {
      req.params.id = 'inbox123';

      const mockInbox = {
        _id: 'inbox123',
        type: 'announcement',
        status: 'Sent'
      };
      InboxEntity.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockInbox)
      });
      InboxEntity.findByIdAndUpdate = jest.fn().mockResolvedValue({ ...mockInbox, status: 'Rejected' });

      await rejectInboxEntity(req, res);

      expect(StudentTeam.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(Team.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(InboxEntity.findByIdAndUpdate).toHaveBeenCalledWith('inbox123', { status: 'Rejected' });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle database error', async () => {
      req.params.id = 'inbox123';

      InboxEntity.findById = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      await rejectInboxEntity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to reject inbox item',
        error: 'Database error'
      });
    });
  });
});
