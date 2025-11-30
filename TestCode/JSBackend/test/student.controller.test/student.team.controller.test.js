import { jest } from '@jest/globals';

// ==========================================================================
// GLOBAL MOCKS - Mock models before importing controller
// ==========================================================================
const mockStudentTeamMethods = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
  create: jest.fn()
};

const mockInboxEntityMethods = {
  findOne: jest.fn(),
  create: jest.fn()
};

const mockUserMethods = {
  find: jest.fn(),
  findById: jest.fn()
};

const mockRegistrationMethods = {
  findOne: jest.fn()
};

// Mock the model modules
jest.unstable_mockModule('../../models/studentTeam.model.js', () => ({
  default: class MockStudentTeam {
    constructor(data) {
      Object.assign(this, data);
      this.members = data.members || [];
      this.save = jest.fn().mockResolvedValue(this);
    }
    static findOne = mockStudentTeamMethods.findOne;
    static findById = mockStudentTeamMethods.findById;
    static findByIdAndDelete = mockStudentTeamMethods.findByIdAndDelete;
    static find = mockStudentTeamMethods.find;
    static create = mockStudentTeamMethods.create;
  }
}));

jest.unstable_mockModule('../../models/inbox.model.js', () => ({
  default: class MockInboxEntity {
    constructor(data) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    }
    static findOne = mockInboxEntityMethods.findOne;
    static create = mockInboxEntityMethods.create;
  }
}));

jest.unstable_mockModule('../../models/user.model.js', () => ({
  default: class MockUser {
    constructor(data) {
      Object.assign(this, data);
    }
    static find = mockUserMethods.find;
    static findById = mockUserMethods.findById;
  }
}));

jest.unstable_mockModule('../../models/registration.model.js', () => ({
  default: class MockRegistration {
    constructor(data) {
      Object.assign(this, data);
    }
    static findOne = mockRegistrationMethods.findOne;
  }
}));

// Import controller and models after mocking
const {
  createStudentTeam,
  deleteStudentTeam,
  getStudentTeams,
  sendInvitationToJoinTeam,
  getAllStudents,
  showAllStudentTeam,
  updateStudentTeam,
} = await import("../../controllers/student_controller/student.team.controller.js");

const StudentTeam = (await import("../../models/studentTeam.model.js")).default;
const InboxEntity = (await import("../../models/inbox.model.js")).default;
const User = (await import("../../models/user.model.js")).default;
const Registration = (await import("../../models/registration.model.js")).default;

// Helper to mock chainable Mongoose queries (find().populate().lean())
const mockMongooseQuery = (resolvedValue) => {
  return {
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(resolvedValue),
    exec: jest.fn().mockResolvedValue(resolvedValue),
    then: (resolve, reject) => Promise.resolve(resolvedValue).then(resolve, reject),
  };
};

describe('Student Team Controller - Comprehensive Test Suite', () => {
  let req, res;
  const mockLeaderId = 'leader123';
  const mockTeamId = 'team123';

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: { id: mockLeaderId, name: 'Leader Name', email: 'leader@test.com' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. CREATE STUDENT TEAM
  // ==========================================================================
  describe('createStudentTeam', () => {
    const mockSavedTeam = {
      _id: mockTeamId,
      teamName: 'Alpha',
      leader: { _id: mockLeaderId },
      members: []
    };

    beforeEach(() => {
      // Mocks are already set up globally
    });

    it('should create a team successfully with invitations (Happy Path)', async () => {
      req.body = { teamName: 'Alpha', members: ['member1', 'member2'] };
      StudentTeam.findOne.mockResolvedValue(null); // No duplicate
      StudentTeam.findById.mockReturnValue(mockMongooseQuery(mockSavedTeam)); // Return populated
      InboxEntity.create.mockResolvedValue(true);

      await createStudentTeam(req, res);

      expect(StudentTeam.findOne).toHaveBeenCalled();
      expect(InboxEntity.create).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should create a team successfully without members (Happy Path)', async () => {
      req.body = { teamName: 'Solo', members: [] };
      StudentTeam.findOne.mockResolvedValue(null);
      StudentTeam.findById.mockReturnValue(mockMongooseQuery({ ...mockSavedTeam, members: [] }));

      await createStudentTeam(req, res);

      expect(InboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should create team successfully when members is undefined', async () => {
      req.body = { teamName: 'NoMembers' }; // No members field
      StudentTeam.findOne.mockResolvedValue(null);
      StudentTeam.findById.mockReturnValue(mockMongooseQuery(mockSavedTeam));

      await createStudentTeam(req, res);

      expect(InboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should create team successfully when members is not an array', async () => {
      req.body = { teamName: 'BadMembers', members: 'not-an-array' };
      StudentTeam.findOne.mockResolvedValue(null);
      StudentTeam.findById.mockReturnValue(mockMongooseQuery(mockSavedTeam));

      await createStudentTeam(req, res);

      expect(InboxEntity.create).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should trim team name before creating', async () => {
      req.body = { teamName: '  SpacedName  ', members: [] };
      StudentTeam.findOne.mockResolvedValue(null);
      StudentTeam.findById.mockReturnValue(mockMongooseQuery(mockSavedTeam));

      await createStudentTeam(req, res);

      expect(StudentTeam.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ teamName: expect.any(Object) })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 400 if team name is missing or empty string', async () => {
      req.body = { teamName: '   ' }; 
      await createStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Team name is required" });
    });

    it('should return 400 if team name is null', async () => {
      req.body = { teamName: null }; 
      await createStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if team name is undefined', async () => {
      req.body = {}; // No teamName
      await createStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if team name already exists', async () => {
      req.body = { teamName: 'Alpha' };
      StudentTeam.findOne.mockResolvedValue({ _id: 'existing', teamName: 'alpha' });

      await createStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should return 500 on database error', async () => {
      req.body = { teamName: 'ErrorTeam' };
      StudentTeam.findOne.mockRejectedValue(new Error('DB connection failed'));
      await createStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return 500 on populate error', async () => {
      req.body = { teamName: 'PopulateError' };
      StudentTeam.findOne.mockResolvedValue(null);
      StudentTeam.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockRejectedValue(new Error('Populate failed'))
      });
      
      await createStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================================================
  // 2. DELETE STUDENT TEAM
  // ==========================================================================
  describe('deleteStudentTeam', () => {
    it('should delete team if requester is leader (Happy Path)', async () => {
      req.params.teamId = mockTeamId;
      const teamDoc = { _id: mockTeamId, leader: { toString: () => mockLeaderId } };
      
      StudentTeam.findById.mockResolvedValue(teamDoc);
      StudentTeam.findByIdAndDelete.mockResolvedValue(true);

      await deleteStudentTeam(req, res);

      expect(StudentTeam.findByIdAndDelete).toHaveBeenCalledWith(mockTeamId);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if team not found', async () => {
      req.params.teamId = 'missing';
      StudentTeam.findById.mockResolvedValue(null);

      await deleteStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if requester is not leader', async () => {
      req.params.teamId = mockTeamId;
      const teamDoc = { _id: mockTeamId, leader: { toString: () => 'otherUser' } };
      StudentTeam.findById.mockResolvedValue(teamDoc);

      await deleteStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(StudentTeam.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should return 500 on generic error', async () => {
      req.params.teamId = mockTeamId;
      StudentTeam.findById.mockRejectedValue(new Error('DB Error'));
      await deleteStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================================================
  // 3. GET STUDENT TEAMS
  // ==========================================================================
  describe('getStudentTeams', () => {
    it('should return all relevant teams with registration details (Happy Path)', async () => {
      const mockTeams = [
        { _id: 't1', leader: mockLeaderId, teamName: 'Alpha' }, 
        { _id: 't2', members: [{ member: mockLeaderId }], teamName: 'Beta' }
      ];
      const mockReg = { _id: 'reg1', eventId: { _id: 'evt1', title: 'Hackathon', status: 'published', createdAt: new Date() } };

      // 1. Mock single query return
      StudentTeam.find.mockReturnValue(mockMongooseQuery(mockTeams));
      
      // 2. Mock registration check per team
      Registration.findOne.mockImplementation((query) => {
        if (query.teamName === 't1') return mockMongooseQuery(mockReg);
        return mockMongooseQuery(null);
      });

      await getStudentTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data[0].isRegisteredForEvent).toBe(true); // Leader team registered
      expect(data[1].isRegisteredForEvent).toBe(false); // Member team not
    });

    it('should return 401 if user ID is missing from req', async () => {
      req.user.id = null;
      await getStudentTeams(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should return 500 on DB error', async () => {
      StudentTeam.find.mockImplementation(() => { throw new Error('DB fail'); });
      await getStudentTeams(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle teams with no registration gracefully', async () => {
      const mockTeams = [{ _id: 't1', leader: mockLeaderId, teamName: 'Unregistered' }];
      StudentTeam.find.mockReturnValue(mockMongooseQuery(mockTeams));
      Registration.findOne.mockReturnValue(mockMongooseQuery(null)); // No registration

      await getStudentTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const data = res.json.mock.calls[0][0].data;
      expect(data[0].isRegisteredForEvent).toBe(false);
      expect(data[0].linkedEvent).toBeNull();
    });

    it('should handle teams with registration but unpublished event', async () => {
      const mockTeams = [{ _id: 't1', leader: mockLeaderId, teamName: 'Draft' }];
      const mockReg = { _id: 'reg1', eventId: { _id: 'evt1', title: 'Draft Event', status: 'draft', createdAt: new Date() } };
      
      StudentTeam.find.mockReturnValue(mockMongooseQuery(mockTeams));
      Registration.findOne.mockReturnValue(mockMongooseQuery(mockReg));

      await getStudentTeams(req, res);

      const data = res.json.mock.calls[0][0].data;
      expect(data[0].isRegisteredForEvent).toBe(false);
    });

    it('should handle registration with null eventId', async () => {
      const mockTeams = [{ _id: 't1', leader: mockLeaderId, teamName: 'NullEvent' }];
      const mockReg = { _id: 'reg1', eventId: null };
      
      StudentTeam.find.mockReturnValue(mockMongooseQuery(mockTeams));
      Registration.findOne.mockReturnValue(mockMongooseQuery(mockReg));

      await getStudentTeams(req, res);

      const data = res.json.mock.calls[0][0].data;
      expect(data[0].isRegisteredForEvent).toBe(false);
    });

    it('should handle empty teams array', async () => {
      StudentTeam.find.mockReturnValue(mockMongooseQuery([]));

      await getStudentTeams(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json.mock.calls[0][0].count).toBe(0);
    });

    it('should return 500 on registration query error', async () => {
      const mockTeams = [{ _id: 't1', leader: mockLeaderId }];
      StudentTeam.find.mockReturnValue(mockMongooseQuery(mockTeams));
      Registration.findOne.mockImplementation(() => {
        throw new Error('Registration query failed');
      });

      await getStudentTeams(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================================================
  // 4. SEND INVITATION TO JOIN TEAM
  // ==========================================================================
  describe('sendInvitationToJoinTeam', () => {
    let mockTeam;
    beforeEach(() => {
      req.params.teamId = mockTeamId;
      req.user.id = 'requesterId';
      mockTeam = {
        _id: mockTeamId,
        teamName: 'Alpha',
        leader: { toString: () => 'leaderId' },
        members: [],
        save: jest.fn().mockResolvedValue(true)
      };
      // Mocks are already set up globally
    });

    it('should send invitation successfully (Happy Path)', async () => {
      StudentTeam.findById.mockResolvedValue(mockTeam);
      InboxEntity.findOne.mockResolvedValue(null);

      await sendInvitationToJoinTeam(req, res);

      expect(mockTeam.members).toHaveLength(1); 
      expect(mockTeam.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 if team not found', async () => {
      StudentTeam.findById.mockResolvedValue(null);
      await sendInvitationToJoinTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 409 if requester is the leader', async () => {
      mockTeam.leader = { toString: () => req.user.id };
      StudentTeam.findById.mockResolvedValue(mockTeam);
      await sendInvitationToJoinTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should return 409 if requester is already a member', async () => {
      mockTeam.members = [{ member: { toString: () => req.user.id } }];
      StudentTeam.findById.mockResolvedValue(mockTeam);
      await sendInvitationToJoinTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should return 409 if request is already pending', async () => {
      StudentTeam.findById.mockResolvedValue(mockTeam);
      InboxEntity.findOne.mockResolvedValue({ status: 'Sent' });
      await sendInvitationToJoinTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    it('should return 500 on DB error', async () => {
      StudentTeam.findById.mockRejectedValue(new Error('Boom'));
      await sendInvitationToJoinTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return 500 on team save error', async () => {
      StudentTeam.findById.mockResolvedValue(mockTeam);
      InboxEntity.findOne.mockResolvedValue(null);
      mockTeam.save.mockRejectedValue(new Error('Team save failed'));

      await sendInvitationToJoinTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================================================
  // 5 & 6. GET ALL STUDENTS & SHOW ALL TEAMS
  // ==========================================================================
  describe('getAllStudents & showAllStudentTeam', () => {
    it('getAllStudents: should return list of students', async () => {
      User.find.mockReturnValue(mockMongooseQuery([{ name: 'S1' }]));
      await getAllStudents(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getAllStudents: should return 500 on error', async () => {
      User.find.mockImplementation(() => { throw new Error('Err'); });
      await getAllStudents(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('showAllStudentTeam: should return list of teams', async () => {
      StudentTeam.find.mockReturnValue(mockMongooseQuery([{ teamName: 'T1' }]));
      await showAllStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('showAllStudentTeam: should return 500 on error', async () => {
      StudentTeam.find.mockImplementation(() => { throw new Error('Err'); });
      await showAllStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ==========================================================================
  // 7. UPDATE STUDENT TEAM (Full Coverage)
  // ==========================================================================
  describe('updateStudentTeam', () => {
    let mockTeamDoc;
    beforeEach(() => {
      req.params.teamId = mockTeamId;
      mockTeamDoc = {
        _id: mockTeamId,
        teamName: 'Original',
        leader: { toString: () => mockLeaderId },
        members: [
          { member: { toString: () => 'member1' }, status: 'Pending' },
          { member: { toString: () => 'member2' }, status: 'Approved' }
        ],
        save: jest.fn().mockResolvedValue(true)
      };
      // Setup: Return doc for logic, return null for duplicates by default
      StudentTeam.findById.mockResolvedValue(mockTeamDoc); 
      StudentTeam.findOne.mockResolvedValue(null); 
    });

    it('should return 404 if team not found', async () => {
      StudentTeam.findById.mockResolvedValue(null);
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 if user is not leader', async () => {
      req.user.id = 'imposter';
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    // --- Team Name Updates ---
    it('should update team name successfully', async () => {
      req.body = { teamName: 'New Name' };
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce(mockMongooseQuery(mockTeamDoc)); // For final populate
      
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.teamName).toBe('New Name');
      expect(mockTeamDoc.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should not mark as changed if team name is same', async () => {
      req.body = { teamName: 'Original' }; // Same as current
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should trim team name before comparing', async () => {
      req.body = { teamName: '  New Name  ' };
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce(mockMongooseQuery(mockTeamDoc));
      
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.teamName).toBe('New Name');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if team name is empty string', async () => {
      req.body = { teamName: '  ' };
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 409 if team name matches another existing team', async () => {
      req.body = { teamName: 'Taken Name' };
      StudentTeam.findOne.mockResolvedValue({ _id: 'otherTeam' }); 
      
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
    });

    // --- Removing Members ---
    it('should remove members successfully', async () => {
      req.body = { membersToRemove: ['member1'] };
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce(mockMongooseQuery(mockTeamDoc));
      
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.members).toHaveLength(1); 
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle removing non-existent member gracefully', async () => {
      req.body = { membersToRemove: ['ghostMember'] };
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.members).toHaveLength(2); // No change
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle empty membersToRemove array', async () => {
      req.body = { membersToRemove: [] };
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle non-array membersToRemove', async () => {
      req.body = { membersToRemove: 'not-array' };
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should return 400 if attempting to remove the leader', async () => {
      req.body = { membersToRemove: [mockLeaderId] };
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    // --- Updating Status ---
    it('should update member status successfully', async () => {
      req.body = { 
        membersToUpdateStatus: [{ memberId: 'member1', newStatus: 'Approved' }] 
      };
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce(mockMongooseQuery(mockTeamDoc));
      
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.members[0].status).toBe('Approved');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should not mark as changed if status is same', async () => {
      req.body = { 
        membersToUpdateStatus: [{ memberId: 'member1', newStatus: 'Pending' }] 
      };
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle all valid status types', async () => {
      req.body = { 
        membersToUpdateStatus: [
          { memberId: 'member1', newStatus: 'Rejected' },
          { memberId: 'member2', newStatus: 'Pending' }
        ] 
      };
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce(mockMongooseQuery(mockTeamDoc));
      
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.members[0].status).toBe('Rejected');
      expect(mockTeamDoc.members[1].status).toBe('Pending');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 if memberId is missing', async () => {
      req.body = { membersToUpdateStatus: [{ newStatus: 'Approved' }] };
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if newStatus is missing', async () => {
      req.body = { membersToUpdateStatus: [{ memberId: 'member1' }] };
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle empty membersToUpdateStatus array', async () => {
      req.body = { membersToUpdateStatus: [] };
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle non-array membersToUpdateStatus', async () => {
      req.body = { membersToUpdateStatus: 'not-array' };
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should return 400 for invalid status payload', async () => {
      req.body = { membersToUpdateStatus: [{ memberId: 'member1', newStatus: 'Invalid' }] };
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 if attempting to change leader status', async () => {
      req.body = { membersToUpdateStatus: [{ memberId: mockLeaderId, newStatus: 'Rejected' }] };
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 if member to update is not in team', async () => {
      req.body = { membersToUpdateStatus: [{ memberId: 'ghost', newStatus: 'Approved' }] };
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    // --- Adding Members ---
    it('should add new members and send invites', async () => {
      req.body = { membersToAdd: ['newMember'] };
      InboxEntity.findOne.mockResolvedValue(null); // No existing invite
      InboxEntity.create.mockResolvedValue(true);
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce(mockMongooseQuery(mockTeamDoc));

      await updateStudentTeam(req, res);
      expect(mockTeamDoc.members).toHaveLength(3);
      expect(InboxEntity.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should skip adding if member already exists', async () => {
      req.body = { membersToAdd: ['member1'] }; 
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.members).toHaveLength(2); 
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should skip adding if invite already pending', async () => {
      req.body = { membersToAdd: ['newMember'] };
      InboxEntity.findOne.mockResolvedValue({ _id: 'invite' }); 
      
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.members).toHaveLength(2); 
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle empty membersToAdd array', async () => {
      req.body = { membersToAdd: [] };
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle non-array membersToAdd', async () => {
      req.body = { membersToAdd: 'not-array' };
      await updateStudentTeam(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No changes provided" }));
    });

    it('should handle multiple changes in single request', async () => {
      req.body = {
        teamName: 'Updated',
        membersToRemove: ['member1'],
        membersToUpdateStatus: [{ memberId: 'member2', newStatus: 'Rejected' }],
        membersToAdd: ['newMember']
      };
      InboxEntity.findOne.mockResolvedValue(null);
      InboxEntity.create.mockResolvedValue(true);
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce(mockMongooseQuery(mockTeamDoc));

      await updateStudentTeam(req, res);

      expect(mockTeamDoc.teamName).toBe('Updated');
      expect(mockTeamDoc.members).toHaveLength(2); // Removed 1, added 1
      expect(res.status).toHaveBeenCalledWith(200);
    });

    // --- Edge Cases ---
    it('should return 200 with "No changes provided" if payload is empty', async () => {
      req.body = {}; 
      await updateStudentTeam(req, res);
      expect(mockTeamDoc.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle MongoDB duplicate key error (code 11000)', async () => {
      req.body = { teamName: 'RaceCondition' };
      mockTeamDoc.save.mockRejectedValue({ code: 11000 }); 

      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: "Team name already exists" });
    });

    it('should return 500 on generic save error', async () => {
      req.body = { teamName: 'ValidName' };
      mockTeamDoc.save.mockRejectedValue(new Error('DB Fail'));
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return 500 on populate error after save', async () => {
      req.body = { teamName: 'ValidName' };
      StudentTeam.findById
        .mockResolvedValueOnce(mockTeamDoc)
        .mockReturnValueOnce({
          populate: jest.fn().mockReturnThis(),
          lean: jest.fn().mockRejectedValue(new Error('Populate failed'))
        });
      
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should return 500 on InboxEntity.create error when adding members', async () => {
      req.body = { membersToAdd: ['newMember'] };
      InboxEntity.findOne.mockResolvedValue(null);
      InboxEntity.create.mockRejectedValue(new Error('Inbox creation failed'));
      
      await updateStudentTeam(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});