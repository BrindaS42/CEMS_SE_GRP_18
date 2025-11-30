import { jest } from '@jest/globals';

// ------------------------------------------------------------------
// 1. Mocks Setup
// ------------------------------------------------------------------

// Helper to simulate Mongoose chains (lean, populate, select, etc.)
const createMockChain = (data) => {
  return {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(data),
    // Handle direct await on the chain
    then: (resolve) => resolve(data),
  };
};

// Mock Document Structure for Event.create() return value
// It needs a .populate() method that resolves to itself or data
const createMockDocument = (data) => ({
  ...data,
  populate: jest.fn().mockResolvedValue(data),
  save: jest.fn().mockResolvedValue(data),
  _id: data._id || 'new_id'
});

const mockEventModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
};

const mockTeamModel = {
  findById: jest.fn(),
};

const mockUserModel = {
  findById: jest.fn(),
};

const mockInboxEntity = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockPythonClient = {
  post: jest.fn(),
  delete: jest.fn(),
};

// Mock imports using jest.unstable_mockModule
jest.unstable_mockModule('../../models/event.model.js', () => ({
  default: mockEventModel
}));

jest.unstable_mockModule('../../models/organizerTeam.model.js', () => ({
  default: mockTeamModel
}));

jest.unstable_mockModule('../../models/user.model.js', () => ({
  default: mockUserModel
}));

jest.unstable_mockModule('../../models/inbox.model.js', () => ({
  default: mockInboxEntity
}));

jest.unstable_mockModule('../../services/ai.service.js', () => ({
  pythonClient: mockPythonClient
}));

// ------------------------------------------------------------------
// 2. Import Controller
// ------------------------------------------------------------------
const Controller = await import('../../controllers/organizer_controllers/event.manage.controller.js');

describe('Organizer Dashboard Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    
    req = {
      user: { id: 'user123' },
      body: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Suppress console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Helper to verify console logs are called (important for mutation testing)
  const expectConsoleCalled = () => {
    expect(console.log).toHaveBeenCalled();
  };

  // =================================================================
  // Test: saveEvent (Drafts + Invites Logic)
  // =================================================================
  describe('saveEvent', () => {
    it('should create a new draft without subEvents and sponsors', async () => {
      req.body = {
        title: 'Simple Event',
        createdBy: 'team1'
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' },
          _id: 'team1'
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1', 
        title: 'Simple Event', 
        createdBy: 'team1'
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      await Controller.saveEvent(req, res);

      expect(mockEventModel.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Simple Event',
        status: 'draft',
        college: 'Test College'
      }));

      // No invites should be created
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle empty subEvents and sponsors arrays', async () => {
      req.body = {
        title: 'Event with empty arrays',
        createdBy: 'team1',
        subEvents: [],
        sponsors: []
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' },
          _id: 'team1'
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        subEvents: [],
        sponsors: []
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      await Controller.saveEvent(req, res);

      // No invites should be created for empty arrays
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should process multiple subEvents and sponsors', async () => {
      req.body = {
        title: 'Multi Event',
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }, { subevent: 'subEventId2' }],
        sponsors: [{ sponsor: 'sponsorId1' }, { sponsor: 'sponsorId2' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' },
          _id: 'team1'
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        subEvents: [{ subevent: 'subEventId1' }, { subevent: 'subEventId2' }],
        sponsors: [{ sponsor: 'sponsorId1' }, { sponsor: 'sponsorId2' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      mockEventModel.findById.mockImplementation((id) => {
        if (id === 'subEventId1' || id === 'subEventId2') {
          return {
            populate: jest.fn().mockResolvedValue({
              title: `Sub Event ${id}`,
              createdBy: { leader: `leader${id}` }
            })
          };
        }
        return createMockChain(null);
      });

      mockInboxEntity.findOne.mockResolvedValue(null);

      await Controller.saveEvent(req, res);

      // Verify multiple invites were created
      expect(mockInboxEntity.create).toHaveBeenCalledTimes(4); // 2 subevents + 2 sponsors
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should create a new draft and process invites', async () => {
      req.body = {
        title: 'New Event',
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }],
        sponsors: [{ sponsor: 'sponsorId1' }]
      };

      // 1. Mock Team Leader Lookup (for main event creation context)
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' },
          _id: 'team1'
        }),
        // Also needed for sendSubEventInvites/sendSponsorshipInvites .select().lean()
        select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      // 2. Mock Event Creation
      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1', 
        title: 'New Event', 
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }],
        sponsors: [{ sponsor: 'sponsorId1' }] 
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      // 3. Mock SubEvent Lookup (for invitation logic)
      // When finding subevent to get its leader
      mockEventModel.findById.mockImplementation((id) => {
        if (id === 'subEventId1') {
          return {
            populate: jest.fn().mockResolvedValue({
              title: 'Sub Event',
              createdBy: { leader: 'subEventLeaderId' }
            })
          };
        }
        return createMockChain(null);
      });

      // 4. Mock Inbox Checks (No existing invites)
      mockInboxEntity.findOne.mockResolvedValue(null);

      await Controller.saveEvent(req, res);

      // Verify Event Creation
      expect(mockEventModel.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Event',
        status: 'draft',
        college: 'Test College',
        sponsors: expect.arrayContaining([expect.objectContaining({ sponsor: 'sponsorId1' })])
      }));

      // Verify SubEvent Invite
      expect(mockInboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'subevent_invite',
        to: ['subEventLeaderId'],
        relatedEvent: 'evt1'
      }));

      // Verify Sponsorship Invite
      expect(mockInboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'sponsorship_request',
        to: ['sponsorId1'],
        relatedEvent: 'evt1'
      }));

      expect(res.status).toHaveBeenCalledWith(200);
      expect(console.log).toHaveBeenCalled(); // Verify logging
    });

    it('should update an existing draft', async () => {
      req.body = { _id: 'evt1', title: 'Updated' };
      
      mockEventModel.findByIdAndUpdate.mockReturnValue(createMockChain({ _id: 'evt1', title: 'Updated' }));

      await Controller.saveEvent(req, res);

      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Draft updated successfully" }));
    });

    it('should return 404 when updating non-existent draft', async () => {
      req.body = { _id: 'nonexistent', title: 'Updated' };
      
      mockEventModel.findByIdAndUpdate.mockReturnValue(createMockChain(null));

      await Controller.saveEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        message: "Draft not found to update." 
      }));
    });

    it('should fail if team leader college cannot be determined', async () => {
      req.body = { createdBy: 'team1' };
      // Mock team with no leader/college
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await Controller.saveEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Could not determine college from team leader. Event cannot be saved." }));
    });

    it('should handle errors gracefully', async () => {
      req.body = { title: 'Test', createdBy: 'team1' };
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ leader: { college: 'Test' } })
      });
      mockEventModel.create.mockRejectedValue(new Error("Save failed"));
      
      await Controller.saveEvent(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to save event as draft"
      }));
    });

    it('should skip existing subevent invites', async () => {
      req.body = {
        title: 'Event with existing invite',
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1', 
        subEvents: [{ subevent: 'subEventId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      mockEventModel.findById.mockImplementation((id) => {
        if (id === 'subEventId1') {
          return {
            populate: jest.fn().mockResolvedValue({
              title: 'Sub Event',
              createdBy: { leader: 'subEventLeaderId' }
            })
          };
        }
        return createMockChain(null);
      });

      // Mock existing invite
      mockInboxEntity.findOne.mockResolvedValue({ _id: 'existingInvite' });

      await Controller.saveEvent(req, res);

      // Should not create duplicate invite
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle missing subevent leader gracefully', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        subEvents: [{ subevent: 'subEventId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      // Mock subevent without leader
      mockEventModel.findById.mockImplementation((id) => {
        if (id === 'subEventId1') {
          return {
            populate: jest.fn().mockResolvedValue(null)
          };
        }
        return createMockChain(null);
      });

      mockInboxEntity.findOne.mockResolvedValue(null);

      await Controller.saveEvent(req, res);

      // Should not crash, just skip the invite
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled(); // Should log error
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle subevent with createdBy but no leader', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        subEvents: [{ subevent: 'subEventId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      // Mock subevent with createdBy but no leader
      mockEventModel.findById.mockImplementation((id) => {
        if (id === 'subEventId1') {
          return {
            populate: jest.fn().mockResolvedValue({
              title: 'Sub Event',
              createdBy: {} // No leader property
            })
          };
        }
        return createMockChain(null);
      });

      mockInboxEntity.findOne.mockResolvedValue(null);

      await Controller.saveEvent(req, res);

      // Should not crash, just skip the invite
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors in subevent invite processing', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        subEvents: [{ subevent: 'subEventId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      mockEventModel.findById.mockImplementation((id) => {
        if (id === 'subEventId1') {
          throw new Error('Database error');
        }
        return createMockChain(null);
      });

      await Controller.saveEvent(req, res);

      // Should handle error gracefully and still return success
      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle missing team when sending subevent invites', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        subEvents: [{ subevent: 'subEventId1' }]
      };

      // First call for college determination
      mockTeamModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        })
      });

      // Second call for invite - returns null team
      mockTeamModel.findById.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null)
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        subEvents: [{ subevent: 'subEventId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      await Controller.saveEvent(req, res);

      // Should log error but still succeed
      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle sponsorship invites without sponsor ID', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        sponsors: [{ status: 'Pending' }] // No sponsor ID
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        sponsors: [{ status: 'Pending' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      await Controller.saveEvent(req, res);

      // Should skip sponsor invite without ID
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should create sponsorship invite with _id property', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        sponsors: [{ _id: 'sponsorId1' }] // Using _id instead of sponsor
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        sponsors: [{ _id: 'sponsorId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      mockInboxEntity.findOne.mockResolvedValue(null);

      await Controller.saveEvent(req, res);

      expect(mockInboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'sponsorship_request',
        to: ['sponsorId1'],
        relatedEvent: 'evt1'
      }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should skip existing sponsorship invites', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      // Mock existing sponsorship invite
      mockInboxEntity.findOne.mockResolvedValue({ _id: 'existingInvite', status: 'Pending' });

      await Controller.saveEvent(req, res);

      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should create invite for Approved status in existing sponsorship', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      // Mock existing sponsorship invite with Approved status (should still be skipped)
      mockInboxEntity.findOne.mockResolvedValue({ _id: 'existingInvite', status: 'Approved' });

      await Controller.saveEvent(req, res);

      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors in sponsorship invite processing', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        }),
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ leader: 'leader1' })
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      mockInboxEntity.findOne.mockRejectedValue(new Error('DB error'));

      await Controller.saveEvent(req, res);

      // Should handle error gracefully
      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle missing team when sending sponsorship invites', async () => {
      req.body = {
        title: 'Event',
        createdBy: 'team1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      };

      // First call for college determination
      mockTeamModel.findById.mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue({ 
          leader: { college: 'Test College', _id: 'leader1' }
        })
      });

      // Second call for invite - returns team without leader
      mockTeamModel.findById.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({}) // No leader
        })
      });

      const mockCreatedEvent = createMockDocument({ 
        _id: 'evt1',
        sponsors: [{ sponsor: 'sponsorId1' }]
      });
      mockEventModel.create.mockResolvedValue(mockCreatedEvent);

      await Controller.saveEvent(req, res);

      // Should log error but still succeed
      expect(console.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // =================================================================
  // Test: publishEvent
  // =================================================================
  describe('publishEvent', () => {
    it('should return 400 if college cannot be determined', async () => {
      req.body = { 
        title: 'Event', 
        createdBy: 'team1'
      };

      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await Controller.publishEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Could not determine college from team leader. Event cannot be published."
      }));
    });

    it('should return 404 when updating non-existent event', async () => {
      req.body = { _id: 'nonexistent', title: 'Updated' };

      mockEventModel.findByIdAndUpdate.mockReturnValue(createMockChain(null));

      await Controller.publishEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Event not found to publish."
      }));
    });

    it('should publish a new event and index it via AI service', async () => {
      req.body = { 
        title: 'Public Event', 
        createdBy: 'team1' 
      };

      // Mock College Fetch
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ leader: { college: 'ABC' } })
      });

      const mockEvent = createMockDocument({ _id: 'evt1', status: 'published' });
      mockEventModel.create.mockResolvedValue(mockEvent);

      await Controller.publishEvent(req, res);

      expect(mockEventModel.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'published',
        college: 'ABC'
      }));

      // Verify AI Indexing call
      expect(mockPythonClient.post).toHaveBeenCalledWith('/recommend/add/evt1');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should update and publish existing event', async () => {
      req.body = { _id: 'evt1', title: 'Updated Public' };

      mockEventModel.findByIdAndUpdate.mockReturnValue(createMockChain({ _id: 'evt1' }));

      await Controller.publishEvent(req, res);

      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'evt1',
        expect.objectContaining({ status: 'published' }),
        expect.anything()
      );
      expect(mockPythonClient.post).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should catch AI service errors but still return success', async () => {
      req.body = { _id: 'evt1' };
      mockEventModel.findByIdAndUpdate.mockReturnValue(createMockChain({ _id: 'evt1' }));
      mockPythonClient.post.mockRejectedValue(new Error("AI Down"));

      await Controller.publishEvent(req, res);

      expect(mockPythonClient.post).toHaveBeenCalled();
      // Should not be 500
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle general errors in publishEvent', async () => {
      req.body = { title: 'Event', createdBy: 'team1' };
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ leader: { college: 'ABC' } })
      });
      mockEventModel.create.mockRejectedValue(new Error('Database error'));

      await Controller.publishEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to publish event"
      }));
    });
  });

  // =================================================================
  // Test: getEventById
  // =================================================================
  describe('getEventById', () => {
    it('should return event details', async () => {
      req.params.id = 'evt1';
      const mockEvent = { title: 'Event' };
      mockEventModel.findById.mockReturnValue(createMockChain(mockEvent));

      await Controller.getEventById(req, res);

      expect(mockEventModel.findById).toHaveBeenCalledWith('evt1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvent);
    });

    it('should return 404 if not found', async () => {
      req.params.id = 'evt1';
      mockEventModel.findById.mockReturnValue(createMockChain(null));

      await Controller.getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Event not found"
      }));
    });

    it('should handle errors in getEventById', async () => {
      req.params.id = 'evt1';
      mockEventModel.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await Controller.getEventById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to fetch event"
      }));
    });
  });

  // =================================================================
  // Test: editEvent
  // =================================================================
  describe('editEvent', () => {
    it('should update event', async () => {
      req.params.id = 'evt1';
      req.body = { title: 'New Title' };
      mockEventModel.findByIdAndUpdate.mockReturnValue(createMockChain({ title: 'New Title' }));

      await Controller.editEvent(req, res);

      expect(mockEventModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Event updated successfully"
      }));
    });

    it('should return 404 if event missing', async () => {
      req.params.id = 'evt1';
      mockEventModel.findByIdAndUpdate.mockReturnValue(createMockChain(null));

      await Controller.editEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Event not found"
      }));
    });

    it('should handle errors in editEvent', async () => {
      req.params.id = 'evt1';
      req.body = { title: 'New Title' };
      mockEventModel.findByIdAndUpdate.mockImplementation(() => {
        throw new Error('Update failed');
      });

      await Controller.editEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to update event"
      }));
    });
  });

  // =================================================================
  // Test: completeEvent
  // =================================================================
  describe('completeEvent', () => {
    it('should complete event if user is team leader', async () => {
      req.params.id = 'evt1';
      req.user.id = 'leader1';

      // Mock findById to check permissions
      // We need a document that has a save() method
      const mockEventDoc = {
        _id: 'evt1',
        createdBy: { leader: 'leader1' }, // Matches user
        status: 'published',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true)
      };

      // Mock the initial findById
      mockEventModel.findById.mockImplementationOnce(() => ({
        populate: jest.fn().mockResolvedValue(mockEventDoc)
      }));

      // Mock the second findById for returning updated data
      mockEventModel.findById.mockImplementationOnce(() => createMockChain(mockEventDoc));

      await Controller.completeEvent(req, res);

      expect(mockEventDoc.status).toBe('completed');
      expect(mockEventDoc.save).toHaveBeenCalled();
      expect(mockPythonClient.delete).toHaveBeenCalledWith('/recommend/delete/evt1');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 403 if user is not team leader', async () => {
      req.params.id = 'evt1';
      req.user.id = 'otherUser';

      const mockEventDoc = {
        createdBy: { leader: 'leader1' },
      };
      
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEventDoc)
      });

      await Controller.completeEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if event not found', async () => {
      req.params.id = 'evt1';
      mockEventModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await Controller.completeEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Event not found"
      }));
    });

    it('should handle errors in completeEvent', async () => {
      req.params.id = 'evt1';
      req.user.id = 'leader1';
      
      mockEventModel.findById.mockImplementation(() => {
        throw new Error('Database error');
      });

      await Controller.completeEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to complete event"
      }));
    });

    it('should handle AI service errors when completing event', async () => {
      req.params.id = 'evt1';
      req.user.id = 'leader1';

      const mockEventDoc = {
        _id: 'evt1',
        createdBy: { leader: 'leader1' },
        status: 'published',
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockResolvedValue(true)
      };

      mockEventModel.findById.mockImplementationOnce(() => ({
        populate: jest.fn().mockResolvedValue(mockEventDoc)
      }));

      mockEventModel.findById.mockImplementationOnce(() => createMockChain(mockEventDoc));

      mockPythonClient.delete.mockRejectedValue(new Error('AI service down'));

      await Controller.completeEvent(req, res);

      // Should still succeed despite AI error
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockEventDoc.save).toHaveBeenCalled();
    });
  });

  // =================================================================
  // Test: deleteEvent
  // =================================================================
  describe('deleteEvent', () => {
    it('should delete event', async () => {
      req.params.id = 'evt1';
      mockEventModel.findByIdAndDelete.mockResolvedValue({ _id: 'evt1' });

      await Controller.deleteEvent(req, res);

      expect(mockEventModel.findByIdAndDelete).toHaveBeenCalledWith('evt1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Event deleted successfully"
      }));
    });

    it('should return 404 if not found', async () => {
      req.params.id = 'evt1';
      mockEventModel.findByIdAndDelete.mockResolvedValue(null);
      await Controller.deleteEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Event not found"
      }));
    });

    it('should handle errors in deleteEvent', async () => {
      req.params.id = 'evt1';
      mockEventModel.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

      await Controller.deleteEvent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to delete event"
      }));
    });
  });

  // =================================================================
  // Test: getPotentialSubEvents
  // =================================================================
  describe('getPotentialSubEvents', () => {
    it('should return events from the same college', async () => {
      req.params.teamId = 'team1';

      // Mock Team Lookup
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          leader: { college: 'College A' }
        })
      });

      // Mock Event Find
      const mockEvents = [{ title: 'Potentia' }];
      mockEventModel.find.mockReturnValue(createMockChain(mockEvents));

      await Controller.getPotentialSubEvents(req, res);

      expect(mockEventModel.find).toHaveBeenCalledWith({ college: 'College A', status: 'published' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it('should return empty array if team/college not found', async () => {
      req.params.teamId = 'team1';
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await Controller.getPotentialSubEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle errors', async () => {
      req.params.teamId = 'team1';
      mockTeamModel.findById.mockImplementation(() => { throw new Error("DB Error"); });

      await Controller.getPotentialSubEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: "Failed to fetch potential sub-events"
      }));
    });

    it('should return empty array when team exists but has no college', async () => {
      req.params.teamId = 'team1';
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({ 
          leader: {} // No college field
        })
      });

      await Controller.getPotentialSubEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle Event.find errors', async () => {
      req.params.teamId = 'team1';
      mockTeamModel.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          leader: { college: 'College A' }
        })
      });

      mockEventModel.find.mockImplementation(() => {
        throw new Error('Query failed');
      });

      await Controller.getPotentialSubEvents(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

});