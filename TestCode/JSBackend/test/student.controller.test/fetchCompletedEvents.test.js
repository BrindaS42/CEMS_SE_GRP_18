import { jest } from '@jest/globals';
import * as StudentController from '../../controllers/student_controller/student.dashboard.controller.js';
import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import StudentTeam from "../../models/studentTeam.model.js";

// Mock model functions
Registration.find = jest.fn();
Event.find = jest.fn();
StudentTeam.find = jest.fn();

describe('Student Controller - FetchTheListOfCompletedEventsByPID', () => {
    let req, res;

    beforeEach(() => {
        req = { user: { id: 'user123' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    it('should successfully return a list of completed events', async () => {
        // Mock Helper chain
        StudentTeam.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([]) // No teams
        });
        Registration.find.mockReturnValue({
            select: jest.fn().mockResolvedValue([{ eventId: 'eventComp1' }])
        });

        // Mock Event chain
        const mockCompletedEvents = [{ _id: 'eventComp1', title: 'Old Hackathon', status: 'completed' }];
        Event.find.mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockCompletedEvents)
        });

        await StudentController.FetchTheListOfCompletedEventsByPID(req, res);

        expect(Event.find).toHaveBeenCalledWith({
            _id: { $in: ['eventComp1'] },
            status: "completed" // Specific check for this controller
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Successfully fetched registered events.",
            count: 1,
            data: mockCompletedEvents
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.message).toBe("Successfully fetched registered events.");
        expect(response.count).toBe(1);
        expect(response.data).toEqual(mockCompletedEvents);
    });

    it('should return 500 on server error', async () => {
        StudentTeam.find.mockImplementation(() => { throw new Error("DB Error"); });

        await StudentController.FetchTheListOfCompletedEventsByPID(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            message: "Server error while fetching registered events."
        }));
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(false);
        expect(response.message).toBe("Server error while fetching registered events.");
        expect(response.error).toBe("DB Error");
    });
});