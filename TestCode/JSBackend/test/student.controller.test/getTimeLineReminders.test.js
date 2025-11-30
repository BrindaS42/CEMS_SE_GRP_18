import { jest } from '@jest/globals';
import * as StudentController from '../../controllers/student_controller/student.dashboard.controller.js';
import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import StudentTeam from "../../models/studentTeam.model.js";

// Mock model functions
Registration.find = jest.fn();
Event.find = jest.fn();
StudentTeam.find = jest.fn();

describe('Student Controller - GetTheTimeLineReminders', () => {
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

    it('should return events when upcoming deadlines exist', async () => {
        // Helper Mocks
        StudentTeam.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
        Registration.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ eventId: 'ev1' }]) });

        // Main Query Mocks: Chain .select().sort().lean()
        const mockEventList = [{ title: "Upcoming Event" }];
        const mockLean = jest.fn().mockResolvedValue(mockEventList);
        const mockSort = jest.fn().mockReturnValue({ lean: mockLean });
        const mockSelect = jest.fn().mockReturnValue({ sort: mockSort });
        
        Event.find.mockReturnValue({ select: mockSelect });

        await StudentController.GetTheTimeLineReminders(req, res);

        expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
            _id: { $in: ['ev1'] },
            status: "published",
            timeline: expect.any(Object) // Checks if the complex date query is constructed
        }));
        // Validate the complex timeline query structure to kill ObjectLiteral mutations
        const eventQuery = Event.find.mock.calls[0][0];
        expect(eventQuery).toHaveProperty('_id');
        expect(eventQuery._id).toEqual({ $in: ['ev1'] });
        expect(eventQuery.status).toBe("published");
        expect(eventQuery).toHaveProperty('timeline');
        expect(eventQuery.timeline).toHaveProperty('$elemMatch');
        expect(eventQuery.timeline.$elemMatch).toHaveProperty('$or');
        expect(eventQuery.timeline.$elemMatch.$or).toHaveLength(2);
        // Validate date query structure
        expect(eventQuery.timeline.$elemMatch.$or[0]).toHaveProperty('date');
        expect(eventQuery.timeline.$elemMatch.$or[0].date).toHaveProperty('$gte');
        expect(eventQuery.timeline.$elemMatch.$or[0].date).toHaveProperty('$lte');
        expect(eventQuery.timeline.$elemMatch.$or[1]).toHaveProperty(['duration.from']);
        expect(eventQuery.timeline.$elemMatch.$or[1]['duration.from']).toHaveProperty('$gte');
        expect(eventQuery.timeline.$elemMatch.$or[1]['duration.from']).toHaveProperty('$lte');
        expect(mockSelect).toHaveBeenCalledWith("title description posterUrl categoryTags timeline");
        // Validate sort was called with correct object and direction
        expect(mockSort).toHaveBeenCalledWith({ publishedAt: -1 });
        const sortArg = mockSort.mock.calls[0][0];
        expect(sortArg).toHaveProperty('publishedAt');
        expect(sortArg.publishedAt).toBe(-1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "Successfully fetched upcoming events.",
            count: 1,
            data: mockEventList
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.message).toBe("Successfully fetched upcoming events.");
        expect(response.count).toBe(1);
        expect(response.data).toEqual(mockEventList);
    });

    it('should return a specific message if no upcoming events are found', async () => {
        StudentTeam.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
        Registration.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });

        // Return empty array
        Event.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    lean: jest.fn().mockResolvedValue([]) 
                })
            })
        });

        await StudentController.GetTheTimeLineReminders(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "No upcoming events found for this week.",
            count: 0,
            data: []
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.message).toBe("No upcoming events found for this week.");
        expect(response.count).toBe(0);
        expect(response.data).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
        StudentTeam.find.mockImplementation(() => { throw new Error("Fail"); });
        await StudentController.GetTheTimeLineReminders(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Server error while fetching upcoming events.",
            error: "Fail"
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(false);
        expect(response.message).toBe("Server error while fetching upcoming events.");
        expect(response.error).toBe("Fail");
    });
});