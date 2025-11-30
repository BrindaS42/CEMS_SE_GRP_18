import { jest } from '@jest/globals';

// ------------------------------------------------------------------
// 1. Mocks Setup
// ------------------------------------------------------------------

// Helper for Mongoose Chains (populate, collation, etc.)
const createMockChain = (data) => {
  return {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    collation: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(data),
    then: (resolve) => resolve(data), // For direct awaits
  };
};

// Helper for Mongoose Documents (save method)
const createMockDocument = (data) => ({
  ...data,
  save: jest.fn().mockResolvedValue(data),
  // Handle array filtering for members in updateTeam
  members: data.members || [], 
  _id: data._id || 'doc_id'
});

const mockTeamModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockUserModel = {
  findById: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockInboxEntity = {
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn(),
};

// Mock Imports using jest.unstable_mockModule
jest.unstable_mockModule('../../models/organizerTeam.model.js', () => ({
  default: mockTeamModel
}));

jest.unstable_mockModule('../../models/user.model.js', () => ({
  default: mockUserModel
}));

jest.unstable_mockModule('../../models/inbox.model.js', () => ({
  default: mockInboxEntity
}));

// ------------------------------------------------------------------
// 2. Import Controller
// ------------------------------------------------------------------
const TeamController = await import('../../controllers/organizer_controllers/event.team.controller.js');

describe('Organizer Team Controller', () => {
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
    // Suppress console errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =================================================================
  // createTeamForEvent
  // =================================================================
  describe('createTeamForEvent', () => {
    it('should return 400 if name is missing', async () => {
      req.body = { description: 'desc' };
      await TeamController.createTeamForEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Team name is required" });
    });

    it('should return 400 if name is only whitespace', async () => {
      req.body = { name: '   ', description: 'desc' };
      await TeamController.createTeamForEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Team name is required" });
    });

    it('should return 400 if name is empty string', async () => {
      req.body = { name: '', description: 'desc' };
      await TeamController.createTeamForEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Team name is required" });
    });

    it('should trim team name before creating', async () => {
      req.body = { name: '  New Team  ', members: [] };
      mockTeamModel.findOne.mockResolvedValue(null);
      const mockTeam = createMockDocument({ _id: 't1', name: 'New Team' });
      mockTeamModel.create.mockResolvedValue(mockTeam);
      
      await TeamController.createTeamForEvent(req, res);
      
      expect(mockTeamModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ name: expect.any(Object) })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 409 if team name exists', async () => {
      req.body = { name: 'Existing Team' };
      mockTeamModel.findOne.mockResolvedValue({ name: 'Existing Team' });
      await TeamController.createTeamForEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should create team and invite members', async () => {
      req.body = { 
        name: 'New Team', 
        members: [{ user: 'u2', role: 'editor' }] 
      };
      
      mockTeamModel.findOne.mockResolvedValue(null); // No conflict
      mockUserModel.findById.mockResolvedValue({ _id: 'u2' }); // User exists
      
      const mockTeam = createMockDocument({ 
        _id: 't1', 
        name: 'New Team',
        members: [{ user: 'u2', role: 'editor' }] 
      });
      mockTeamModel.create.mockResolvedValue(mockTeam);
      
      // No existing invitation
      mockInboxEntity.findOne.mockResolvedValue(null);

      await TeamController.createTeamForEvent(req, res);

      expect(mockTeamModel.create).toHaveBeenCalled();
      expect(mockInboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
        type: 'team_invite',
        to: 'u2'
      }));
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should create team without members when members array is empty', async () => {
      req.body = { name: 'Solo Team', members: [] };
      mockTeamModel.findOne.mockResolvedValue(null);
      const mockTeam = createMockDocument({ _id: 't1', name: 'Solo Team', members: [] });
      mockTeamModel.create.mockResolvedValue(mockTeam);
      
      await TeamController.createTeamForEvent(req, res);
      
      expect(mockTeamModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ members: [] })
      );
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should create team without members when members is undefined', async () => {
      req.body = { name: 'Solo Team' }; // No members field
      mockTeamModel.findOne.mockResolvedValue(null);
      const mockTeam = createMockDocument({ _id: 't1', name: 'Solo Team' });
      mockTeamModel.create.mockResolvedValue(mockTeam);
      
      await TeamController.createTeamForEvent(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should use default volunteer role when role not provided', async () => {
      req.body = { 
        name: 'Team', 
        members: [{ user: 'u2' }] // No role specified
      };
      mockTeamModel.findOne.mockResolvedValue(null);
      mockUserModel.findById.mockResolvedValue({ _id: 'u2' });
      const mockTeam = createMockDocument({ _id: 't1', name: 'Team' });
      mockTeamModel.create.mockResolvedValue(mockTeam);
      mockInboxEntity.findOne.mockResolvedValue(null);
      
      await TeamController.createTeamForEvent(req, res);
      
      expect(mockTeamModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          members: expect.arrayContaining([
            expect.objectContaining({ role: 'volunteer' })
          ])
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle non-array members gracefully', async () => {
      req.body = { name: 'Team', members: 'not-an-array' };
      mockTeamModel.findOne.mockResolvedValue(null);
      const mockTeam = createMockDocument({ _id: 't1', name: 'Team' });
      mockTeamModel.create.mockResolvedValue(mockTeam);
      
      await TeamController.createTeamForEvent(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle user not found gracefully during member loop', async () => {
      req.body = { name: 'Team', members: [{ user: 'u999' }] };
      mockTeamModel.findOne.mockResolvedValue(null);
      mockUserModel.findById.mockResolvedValue(null); // User missing
      
      mockTeamModel.create.mockResolvedValue(createMockDocument({ name: 'Team' }));
      
      await TeamController.createTeamForEvent(req, res);
      
      expect(console.error).toHaveBeenCalled(); // Should log error
      expect(res.status).toHaveBeenCalledWith(201); // Still creates team
    });

    it('should not send invite if one exists', async () => {
      req.body = { name: 'Team', members: [{ user: 'u2' }] };
      mockTeamModel.findOne.mockResolvedValue(null);
      mockUserModel.findById.mockResolvedValue({ _id: 'u2' });
      mockTeamModel.create.mockResolvedValue(createMockDocument({ _id: 't1', name: 'Team' }));
      
      mockInboxEntity.findOne.mockResolvedValue({ _id: 'inv1' }); // Exists

      await TeamController.createTeamForEvent(req, res);
      
      expect(mockInboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle DB errors', async () => {
      req.body = { name: 'T' };
      mockTeamModel.findOne.mockRejectedValue(new Error("DB"));
      await TeamController.createTeamForEvent(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // getTeamList
  // =================================================================
  describe('getTeamList', () => {
    it('should return teams list', async () => {
      mockTeamModel.find.mockReturnValue(createMockChain([{ name: 'T1' }]));
      await TeamController.getTeamList(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ name: 'T1' }]);
    });

    it('should handle errors', async () => {
      mockTeamModel.find.mockImplementation(() => { throw new Error("DB"); });
      await TeamController.getTeamList(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // getAllUserDetails
  // =================================================================
  describe('getAllUserDetails', () => {
    it('should return organizers', async () => {
      mockUserModel.find.mockResolvedValue([{ username: 'org' }]);
      await TeamController.getAllUserDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
      mockUserModel.find.mockRejectedValue(new Error("DB"));
      await TeamController.getAllUserDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // respondToInvitation
  // =================================================================
  describe('respondToInvitation', () => {
    it('should return 400 for invalid inputs', async () => {
      req.body = {};
      await TeamController.respondToInvitation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if invitation not found', async () => {
      req.body = { invitationId: 'inv1', decision: 'Approved' };
      mockInboxEntity.findOne.mockResolvedValue(null);
      await TeamController.respondToInvitation(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if unauthorized', async () => {
      req.body = { invitationId: 'inv1', decision: 'Approved' };
      mockInboxEntity.findOne.mockResolvedValue(createMockDocument({ 
        to: 'otherUser', 
        status: 'Pending' 
      }));
      await TeamController.respondToInvitation(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should approve invitation and update existing member status', async () => {
      req.body = { invitationId: 'inv1', decision: 'Approved' };
      const mockInvite = createMockDocument({ 
        _id: 'inv1', 
        to: 'user123', 
        relatedTeam: 't1', 
        status: 'Pending' 
      });
      mockInboxEntity.findOne.mockResolvedValue(mockInvite);

      const mockTeam = createMockDocument({
        _id: 't1',
        members: [{ user: 'user123', status: 'Pending' }]
      });
      mockTeamModel.findById.mockResolvedValue(mockTeam);

      await TeamController.respondToInvitation(req, res);

      expect(mockInvite.status).toBe('Approved');
      expect(mockInvite.save).toHaveBeenCalled();
      expect(mockTeam.members[0].status).toBe('Approved');
      expect(mockTeam.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid decision value', async () => {
      req.body = { invitationId: 'inv1', decision: 'Maybe' };
      await TeamController.respondToInvitation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when invitationId is missing', async () => {
      req.body = { decision: 'Approved' };
      await TeamController.respondToInvitation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when decision is missing', async () => {
      req.body = { invitationId: 'inv1' };
      await TeamController.respondToInvitation(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should approve invitation and add member if not found in team', async () => {
        req.body = { invitationId: 'inv1', decision: 'Approved' };
        const mockInvite = createMockDocument({ 
          _id: 'inv1', to: 'user123', relatedTeam: 't1', status: 'Pending' 
        });
        mockInboxEntity.findOne.mockResolvedValue(mockInvite);
  
        const mockTeam = createMockDocument({ _id: 't1', members: [] }); // Empty members
        mockTeamModel.findById.mockResolvedValue(mockTeam);
  
        await TeamController.respondToInvitation(req, res);
  
        expect(mockTeam.members).toHaveLength(1);
        expect(mockTeam.members[0].status).toBe('Approved');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 500 if team not found during approval', async () => {
        req.body = { invitationId: 'inv1', decision: 'Approved' };
        const mockInvite = createMockDocument({ to: 'user123', relatedTeam: 't1' });
        mockInboxEntity.findOne.mockResolvedValue(mockInvite);
        mockTeamModel.findById.mockResolvedValue(null); // Team gone
  
        await TeamController.respondToInvitation(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should reject invitation and remove member', async () => {
        req.body = { invitationId: 'inv1', decision: 'Rejected' };
        const mockInvite = createMockDocument({ 
          to: 'user123', relatedTeam: 't1', status: 'Pending' 
        });
        mockInboxEntity.findOne.mockResolvedValue(mockInvite);

        const mockTeam = createMockDocument({
            _id: 't1',
            members: [{ user: 'user123' }, { user: 'other' }]
        });
        mockTeamModel.findById.mockResolvedValue(mockTeam);

        await TeamController.respondToInvitation(req, res);

        expect(mockInvite.status).toBe('Rejected');
        expect(mockTeam.members).toHaveLength(1); // user123 removed
        expect(mockTeam.members[0].user).toBe('other');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle rejection even when team is not found', async () => {
        req.body = { invitationId: 'inv1', decision: 'Rejected' };
        const mockInvite = createMockDocument({ 
          to: 'user123', relatedTeam: 't1', status: 'Pending' 
        });
        mockInboxEntity.findOne.mockResolvedValue(mockInvite);
        mockTeamModel.findById.mockResolvedValue(null); // Team missing

        await TeamController.respondToInvitation(req, res);

        expect(mockInvite.status).toBe('Rejected');
        expect(mockInvite.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
        req.body = { invitationId: 'inv1', decision: 'Approved' };
        mockInboxEntity.findOne.mockRejectedValue(new Error("DB"));
        await TeamController.respondToInvitation(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // getTeamDetails
  // =================================================================
  describe('getTeamDetails', () => {
    it('should return team', async () => {
      req.params.teamId = 't1';
      mockTeamModel.findById.mockReturnValue(createMockChain({ name: 'T1' }));
      await TeamController.getTeamDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if not found', async () => {
      req.params.teamId = 't1';
      mockTeamModel.findById.mockReturnValue(createMockChain(null));
      await TeamController.getTeamDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      mockTeamModel.findById.mockImplementation(() => { throw new Error("DB"); });
      await TeamController.getTeamDetails(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // getUserInvitations
  // =================================================================
  describe('getUserInvitations', () => {
    it('should return invitations', async () => {
      mockInboxEntity.find.mockReturnValue(createMockChain([{ title: 'Inv' }]));
      await TeamController.getUserInvitations(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle errors', async () => {
      mockInboxEntity.find.mockImplementation(() => { throw new Error("DB"); });
      await TeamController.getUserInvitations(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // removeTeam
  // =================================================================
  describe('removeTeam', () => {
    it('should delete team', async () => {
      req.params.teamId = 't1';
      mockTeamModel.findById.mockResolvedValue({ leader: 'user123' });
      
      await TeamController.removeTeam(req, res);
      
      expect(mockTeamModel.findByIdAndDelete).toHaveBeenCalledWith('t1');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if team not found', async () => {
      mockTeamModel.findById.mockResolvedValue(null);
      await TeamController.removeTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if not leader', async () => {
      mockTeamModel.findById.mockResolvedValue({ leader: 'other' });
      await TeamController.removeTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should handle errors', async () => {
      mockTeamModel.findById.mockRejectedValue(new Error("DB"));
      await TeamController.removeTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // inviteMemberToTeam
  // =================================================================
  describe('inviteMemberToTeam', () => {
    it('should invite member successfully', async () => {
      req.params.teamId = 't1';
      req.body = { username: 'alice', role: 'editor' };
      
      const mockTeam = createMockDocument({ _id: 't1', leader: 'user123', name: 'T1' });
      mockTeamModel.findById.mockResolvedValue(mockTeam);
      
      mockUserModel.findOne.mockResolvedValue({ _id: 'u2' });
      mockInboxEntity.findOne.mockResolvedValue(null); // No existing invite

      await TeamController.inviteMemberToTeam(req, res);

      expect(mockTeam.members).toHaveLength(1);
      expect(mockInboxEntity.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should use default volunteer role when role not provided', async () => {
      req.params.teamId = 't1';
      req.body = { username: 'alice' }; // No role
      
      const mockTeam = createMockDocument({ _id: 't1', leader: 'user123', name: 'T1', members: [] });
      mockTeamModel.findById.mockResolvedValue(mockTeam);
      mockUserModel.findOne.mockResolvedValue({ _id: 'u2' });
      mockInboxEntity.findOne.mockResolvedValue(null);

      await TeamController.inviteMemberToTeam(req, res);

      expect(mockTeam.members[0].role).toBe('volunteer');
      expect(mockInboxEntity.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'volunteer' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 if team missing', async () => {
      mockTeamModel.findById.mockResolvedValue(null);
      await TeamController.inviteMemberToTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if not leader', async () => {
      mockTeamModel.findById.mockResolvedValue({ leader: 'other' });
      await TeamController.inviteMemberToTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if user missing', async () => {
      mockTeamModel.findById.mockResolvedValue({ leader: 'user123' });
      mockUserModel.findOne.mockResolvedValue(null);
      await TeamController.inviteMemberToTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 if inviting self', async () => {
      mockTeamModel.findById.mockResolvedValue({ leader: 'user123' });
      mockUserModel.findOne.mockResolvedValue({ _id: 'user123' });
      await TeamController.inviteMemberToTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if already member', async () => {
      mockTeamModel.findById.mockResolvedValue({ 
        leader: 'user123', 
        members: [{ user: 'u2' }] 
      });
      mockUserModel.findOne.mockResolvedValue({ _id: 'u2' });
      await TeamController.inviteMemberToTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if invite pending', async () => {
      mockTeamModel.findById.mockResolvedValue({ leader: 'user123', members: [] });
      mockUserModel.findOne.mockResolvedValue({ _id: 'u2' });
      mockInboxEntity.findOne.mockResolvedValue({ _id: 'inv1' });
      await TeamController.inviteMemberToTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle errors', async () => {
      mockTeamModel.findById.mockRejectedValue(new Error("DB"));
      await TeamController.inviteMemberToTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // =================================================================
  // updateTeam
  // =================================================================
  describe('updateTeam', () => {
    let mockTeam;
    beforeEach(() => {
        mockTeam = createMockDocument({ 
            _id: 't1', 
            name: 'Original Name', 
            leader: 'user123', 
            description: 'Desc',
            members: [
                { user: 'u2', role: 'volunteer' },
                { user: 'u3', role: 'editor' }
            ]
        });
        req.params.teamId = 't1';
    });

    it('should update name and description', async () => {
        req.body = { name: 'New Name', description: 'New Desc' };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        // Name check mock: return null (no conflict)
        const chain = createMockChain(null);
        mockTeamModel.findOne.mockReturnValue(chain);

        await TeamController.updateTeam(req, res);

        expect(mockTeam.name).toBe('New Name');
        expect(mockTeam.description).toBe('New Desc');
        expect(mockTeam.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if name is empty', async () => {
        req.body = { name: ' ' };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if name conflicts', async () => {
        req.body = { name: 'Existing' };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockTeamModel.findOne.mockReturnValue(createMockChain({ _id: 'other' }));
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should remove members', async () => {
        req.body = { membersToRemove: ['u2'] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);

        await TeamController.updateTeam(req, res);

        expect(mockTeam.members).toHaveLength(1);
        expect(mockTeam.members[0].user).toBe('u3');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if removing leader', async () => {
        req.body = { membersToRemove: ['user123'] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should update member roles', async () => {
        req.body = { membersToUpdate: [{ memberId: 'u2', newRole: 'co-organizer' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        
        await TeamController.updateTeam(req, res);
        
        expect(mockTeam.members.find(m => m.user === 'u2').role).toBe('co-organizer');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should validate roles during update', async () => {
        req.body = { membersToUpdate: [{ memberId: 'u2', newRole: 'bad-role' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if updating leader role', async () => {
        req.body = { membersToUpdate: [{ memberId: 'user123', newRole: 'volunteer' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should add new members', async () => {
        req.body = { membersToAdd: [{ userId: 'u4', role: 'editor' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        
        mockUserModel.findOne.mockResolvedValue({ _id: 'u4' });
        mockInboxEntity.findOne.mockResolvedValue(null);

        await TeamController.updateTeam(req, res);

        expect(mockTeam.members).toHaveLength(3);
        expect(mockTeam.members[2].user).toBe('u4');
        expect(mockInboxEntity.create).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fail adding member if already member', async () => {
        req.body = { membersToAdd: [{ userId: 'u2' }] }; // u2 is in beforeEach mock
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockUserModel.findOne.mockResolvedValue({ _id: 'u2' });

        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail adding member if user not found', async () => {
        req.body = { membersToAdd: [{ userId: 'missing' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockUserModel.findOne.mockResolvedValue(null);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle no changes', async () => {
        req.body = {}; // No valid fields
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should not consider name change if same name with different case', async () => {
        req.body = { name: 'Original Name' }; // Same as mockTeam
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(mockTeamModel.findOne).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should allow same description without marking as change', async () => {
        req.body = { description: 'Desc' }; // Same as mockTeam
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle updating role of non-existent member gracefully', async () => {
        req.body = { membersToUpdate: [{ memberId: 'nonexistent', newRole: 'editor' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should validate all roles in membersToUpdate array', async () => {
        req.body = { 
          membersToUpdate: [
            { memberId: 'u2', newRole: 'co-organizer' },
            { memberId: 'u3', newRole: 'invalid-role' }
          ] 
        };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should not mark as changed if member role is same as new role', async () => {
        req.body = { membersToUpdate: [{ memberId: 'u2', newRole: 'volunteer' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle empty membersToRemove array', async () => {
        req.body = { membersToRemove: [] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(mockTeam.members).toHaveLength(2); // No change
    });

    it('should handle empty membersToUpdate array', async () => {
        req.body = { membersToUpdate: [] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle empty membersToAdd array', async () => {
        req.body = { membersToAdd: [] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should use default volunteer role for added members without role', async () => {
        req.body = { membersToAdd: [{ userId: 'u4' }] }; // No role
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockUserModel.findOne.mockResolvedValue({ _id: 'u4' });
        mockInboxEntity.findOne.mockResolvedValue(null);
        
        await TeamController.updateTeam(req, res);
        
        expect(mockTeam.members[2].role).toBe('volunteer');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should use default volunteer role for invalid role in membersToAdd', async () => {
        req.body = { membersToAdd: [{ userId: 'u4', role: 'invalid-role' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockUserModel.findOne.mockResolvedValue({ _id: 'u4' });
        mockInboxEntity.findOne.mockResolvedValue(null);
        
        await TeamController.updateTeam(req, res);
        
        expect(mockTeam.members[2].role).toBe('volunteer');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return custom message when members are added', async () => {
        req.body = { membersToAdd: [{ userId: 'u4', role: 'editor' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockUserModel.findOne.mockResolvedValue({ _id: 'u4' });
        mockInboxEntity.findOne.mockResolvedValue(null);
        
        await TeamController.updateTeam(req, res);
        
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({ 
            message: "Team details updated successfully and new invites sent" 
          })
        );
    });

    it('should handle removing non-existent member gracefully', async () => {
        req.body = { membersToRemove: ['nonexistent'] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(mockTeam.members).toHaveLength(2); // No change
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle mongo 11000 error specifically', async () => {
        req.body = { name: 'Conflict' };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockTeamModel.findOne.mockReturnValue(createMockChain(null)); // Pass manual check
        
        const err = new Error("Duplicate");
        err.code = 11000;
        mockTeam.save.mockRejectedValue(err);

        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should handle generic errors', async () => {
        mockTeamModel.findById.mockRejectedValue(new Error("DB"));
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
    
    // Additional Edge Cases for updateTeam
    it('should return 404 if team not found', async () => {
        mockTeamModel.findById.mockResolvedValue(null);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if not leader', async () => {
        mockTeam.leader = 'other';
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    });
    
    it('should return 400 if membersToUpdate payload is invalid', async () => {
        req.body = { membersToUpdate: [{ memberId: null }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    
    it('should return 404 if member to update is not in team', async () => {
        req.body = { membersToUpdate: [{ memberId: 'u999', newRole: 'editor' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
    });
    
    it('should return 400 if membersToAdd payload invalid', async () => {
        req.body = { membersToAdd: [{ userId: null }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if adding leader', async () => {
        req.body = { membersToAdd: [{ userId: 'user123' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockUserModel.findOne.mockResolvedValue({ _id: 'user123' });
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if invitation pending for added member', async () => {
        req.body = { membersToAdd: [{ userId: 'u4' }] };
        mockTeamModel.findById.mockResolvedValue(mockTeam);
        mockUserModel.findOne.mockResolvedValue({ _id: 'u4' });
        mockInboxEntity.findOne.mockResolvedValue({ _id: 'inv1' }); // Exists
        await TeamController.updateTeam(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});