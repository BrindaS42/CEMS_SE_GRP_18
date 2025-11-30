import { jest } from '@jest/globals';
import { submitRegistration } from '../../controllers/event_controllers/registration.controller.js';
import Event from "../../models/event.model.js";
import StudentTeam from "../../models/studentTeam.model.js";
import Registration from "../../models/registration.model.js";
import OrganizerTeam from "../../models/organizerTeam.model.js"; 
import InboxEntity from "../../models/inbox.model.js";
import crypto from "crypto";

// Mock the Event model methods
Event.findById = jest.fn();
Event.findByIdAndUpdate = jest.fn();
Event.find = jest.fn();

// Mock StudentTeam methods
StudentTeam.findOne = jest.fn();
StudentTeam.findById = jest.fn();
StudentTeam.find = jest.fn();

// Mock Registration methods
Registration.findOne = jest.fn();
Registration.find = jest.fn();
Registration.create = jest.fn();
Registration.prototype.save = jest.fn();

// Mock OrganizerTeam methods
OrganizerTeam.findById = jest.fn();
OrganizerTeam.find = jest.fn();

// Mock InboxEntity methods
InboxEntity.create = jest.fn();
InboxEntity.prototype.save = jest.fn();

// Mock crypto
crypto.randomBytes = jest.fn();

describe('submitRegistration Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {
                eventId: 'evt1',
                teamName: null,
                paymentProof: 'link',
                registrationData: {}
            },
            user: { id: 'user1' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        
        // Default crypto mock
        crypto.randomBytes.mockReturnValue({ toString: () => 'CODE123' });
    });

    test('should return 404 if event not found', async () => {
        Event.findById.mockResolvedValue(null);
        await submitRegistration(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Event not found" });
    });

    test('should return 400 if Team event but no teamName provided', async () => {
        Event.findById.mockResolvedValue({ config: { registrationType: 'Team' } });
        req.body.teamName = null;

        await submitRegistration(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Team name is required for this event." });
    });

    test('should return 404 if Team event but Team not found in DB', async () => {
        Event.findById.mockResolvedValue({ config: { registrationType: 'Team' } });
        req.body.teamName = 'SuperStars';
        
        // Return null to simulate not found
        // We mock the .then property so await resolves to null
        StudentTeam.findById.mockReturnValue({
            then: (resolve) => resolve(null)
        });

        await submitRegistration(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Team with name "SuperStars" not found.' });
    });

    test('should return 400 if a team member is already registered', async () => {
        Event.findById.mockResolvedValue({ config: { registrationType: 'Team' } });
        req.body.teamName = 'teamId123';

        const mockTeamData = {
            _id: 'teamId123',
            leader: 'leader1',
            members: [{ member: 'mem1' }]
        };

        // ✅ FIX: Create a mock query object that handles both 'await' and '.lean()'
        const mockQuery = {
            lean: jest.fn().mockResolvedValue(mockTeamData), // For .lean() chain
            then: (resolve) => resolve(mockTeamData)         // For direct await
        };

        // Use mockReturnValue (NOT mockResolvedValue) to return the query object
        StudentTeam.findById.mockReturnValue(mockQuery);

        Registration.findOne.mockResolvedValue({ _id: 'existingReg' });

        await submitRegistration(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ 
            success: false, 
            message: "A member of your team is already registered for this event." 
        });
    });

    test('should return 400 if individual user is already registered', async () => {
        Event.findById.mockResolvedValue({ config: { registrationType: 'Individual' } });
        Registration.findOne.mockResolvedValue({ _id: 'existingReg' });

        await submitRegistration(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "You are already registered for this event." });
    });

    test('should handle PAID event: Pending status and Notify Organizer', async () => {
        Event.findById.mockResolvedValue({
            _id: 'evt1',
            title: 'Paid Event',
            createdBy: 'orgTeam1',
            config: { registrationType: 'Individual', fees: 100 },
            timeline: []
        });
        Registration.findOne.mockResolvedValue(null);

        // Mock OrganizerTeam
        OrganizerTeam.findById.mockReturnValue({
            lean: jest.fn().mockResolvedValue({
                leader: 'orgLeader',
                members: [{ member: 'orgMem' }]
            })
        });

        Registration.create.mockResolvedValue({ _id: 'newReg', status: 'pending' });

        await submitRegistration(req, res);

        expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
            type: "registration_approval_request",
            to: ['orgLeader', 'orgMem'],
            role: "Organizer"
        }));

        expect(Registration.create).toHaveBeenCalledWith(expect.objectContaining({
            paymentStatus: "pending",
            status: "pending"
        }));

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should handle FREE event: Confirmed status, Update Event, Notify User', async () => {
        const mockSave = jest.fn();
        Event.findById.mockResolvedValue({
            _id: 'evt1',
            title: 'Free Event',
            createdBy: 'creator1',
            config: { registrationType: 'Individual', fees: 0 },
            timeline: [{ _id: 'tl1' }],
            registrations: [],
            save: mockSave
        });
        Registration.findOne.mockResolvedValue(null);
        Registration.create.mockResolvedValue({ _id: 'newReg', status: 'confirmed' });

        await submitRegistration(req, res);

        expect(mockSave).toHaveBeenCalled();
        expect(InboxEntity.create).toHaveBeenCalledWith(expect.objectContaining({
            type: "announcement",
            to: ['user1'],
            title: expect.stringContaining('Registration Successful')
        }));

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should catch error in notify function silently', async () => {
        const mockSave = jest.fn();
        Event.findById.mockResolvedValue({
            _id: 'evt1',
            title: 'Free Event',
            config: { fees: 0 },
            timeline: [],
            registrations: [],
            save: mockSave
        });
        Registration.findOne.mockResolvedValue(null);
        Registration.create.mockResolvedValue({ _id: 'reg1' });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        InboxEntity.create.mockRejectedValue(new Error('Notification failed'));

        await submitRegistration(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    test('should return 500 on generic server error', async () => {
        Event.findById.mockRejectedValue(new Error('Fatal Error'));
        await submitRegistration(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
            success: false, 
            message: "Failed to submit registration"
        }));
    });
});