import { jest } from '@jest/globals';
import * as StudentController from '../../controllers/student_controller/student.dashboard.controller.js';
import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import StudentTeam from "../../models/studentTeam.model.js";

// Mock model functions
Registration.find = jest.fn();
Event.find = jest.fn();
StudentTeam.find = jest.fn();

describe('Student Controller - FetchTheListOfRegisteredEventsByPID', () => {
    let req, res;

    beforeEach(() => {
        req = { user: { id: 'user123' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Silence console.error
    });

    it('should successfully return a list of registered events', async () => {
        // 1. Mock Helper: getStudentEventIds logic
        // Mock StudentTeam.find().select()
        StudentTeam.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([{ _id: 'teamA' }])
        });

        // Mock Registration.find().select()
        Registration.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([{ eventId: 'event1' }, { eventId: 'event2' }])
        });

        // 2. Mock Main Logic: Event.find().lean()
        const mockEvents = [{ _id: 'event1', title: 'Hackathon' }, { _id: 'event2', title: 'Workshop' }];
        Event.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockEvents)
        });

        await StudentController.FetchTheListOfRegisteredEventsByPID(req, res);

        // Assertions
        expect(StudentTeam.find).toHaveBeenCalledWith(expect.objectContaining({
             $or: expect.any(Array)
        }));
        // Validate the exact query structure for StudentTeam
        const teamQuery = StudentTeam.find.mock.calls[0][0];
        expect(teamQuery).toHaveProperty('$or');
        expect(teamQuery.$or).toHaveLength(2);
        expect(teamQuery.$or[0]).toHaveProperty('leader', 'user123');
        expect(teamQuery.$or[1]).toHaveProperty('members');
        expect(teamQuery.$or[1].members).toHaveProperty('$elemMatch');
        expect(teamQuery.$or[1].members.$elemMatch).toEqual({ member: 'user123', status: 'Approved' });
        // Verify select was called with exact string
        const teamSelect = StudentTeam.find.mock.results[0].value.select;
        expect(teamSelect).toHaveBeenCalledWith('_id');
        expect(Registration.find).toHaveBeenCalled();
        // Validate Registration query structure
        const regQuery = Registration.find.mock.calls[0][0];
        expect(regQuery).toHaveProperty('$or');
        expect(regQuery.$or).toHaveLength(2);
        expect(regQuery.$or[0]).toEqual({ userId: 'user123' });
        expect(regQuery.$or[1]).toEqual({ teamName: { $in: ['teamA'] } });
        // Verify select was called with exact string
        const regSelect = Registration.find.mock.results[0].value.select;
        expect(regSelect).toHaveBeenCalledWith('eventId');
        expect(Event.find).toHaveBeenCalledWith({
            _id: { $in: ['event1', 'event2'] },
            status: 'published'
        });
        // Validate Event query structure to kill ObjectLiteral mutations
        const eventQuery = Event.find.mock.calls[0][0];
        expect(eventQuery._id).toEqual({ $in: ['event1', 'event2'] });
        expect(eventQuery.status).toBe('published');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Successfully fetched registered events.",
            count: 2,
            data: mockEvents
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.message).toBe("Successfully fetched registered events.");
        expect(response.count).toBe(2);
        expect(response.data).toEqual(mockEvents);
    });

    it('should return 500 if an error occurs', async () => {
        // Force an error in the first DB call
        StudentTeam.find.mockImplementation(() => {
            throw new Error("Database failure");
        });

        await StudentController.FetchTheListOfRegisteredEventsByPID(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Server error while fetching registered events.",
            error: "Database failure"
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(false);
        expect(response.message).toBe("Server error while fetching registered events.");
        expect(response.error).toBe("Database failure");
    });
});