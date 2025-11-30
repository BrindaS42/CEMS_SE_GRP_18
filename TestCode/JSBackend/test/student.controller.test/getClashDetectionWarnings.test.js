import { jest } from '@jest/globals';
import * as StudentController from '../../controllers/student_controller/student.dashboard.controller.js';
import Registration from "../../models/registration.model.js";
import Event from "../../models/event.model.js";
import StudentTeam from "../../models/studentTeam.model.js";

// Mock model functions
Registration.find = jest.fn();
Event.find = jest.fn();
StudentTeam.find = jest.fn();

describe('Student Controller - GetClashDetectionWarnings', () => {
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

    // Helper to mock IDs
    const setupIds = () => {
        StudentTeam.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
        Registration.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ eventId: '1' }, { eventId: '2' }]) });
    };

    it('should return warnings when two events overlap', async () => {
        setupIds();

        // Create two events that overlap
        // Event A: 10:00 - 12:00
        // Event B: 11:00 - 13:00
        const baseDate = new Date("2025-01-01");
        
        const events = [
            {
                _id: '1',
                title: 'Event A',
                timeline: [{ 
                    title: 'Round 1', 
                    duration: { 
                        from: new Date(baseDate.setHours(10,0,0)), 
                        to: new Date(baseDate.setHours(12,0,0)) 
                    } 
                }]
            },
            {
                _id: '2', // Different ID
                title: 'Event B',
                timeline: [{ 
                    title: 'Round 1', 
                    duration: { 
                        from: new Date(baseDate.setHours(11,0,0)), 
                        to: new Date(baseDate.setHours(13,0,0)) 
                    } 
                }]
            }
        ];

        Event.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(events)
            })
        });

        await StudentController.GetClashDetectionWarnings(req, res);

        // Validate Event.find query structure
        expect(Event.find).toHaveBeenCalledWith({
            _id: { $in: ['1', '2'] },
            status: 'published'
        });
        const eventQuery = Event.find.mock.calls[0][0];
        expect(eventQuery._id).toEqual({ $in: ['1', '2'] });
        expect(eventQuery.status).toBe('published');
        // Validate select was called with exact string
        const mockSelect = Event.find.mock.results[0].value.select;
        expect(mockSelect).toHaveBeenCalledWith("title timeline");

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: expect.stringContaining("1 schedule clash(es) detected"),
            data: expect.arrayContaining([
                expect.objectContaining({
                    message: expect.stringContaining('conflicts with')
                })
            ])
        }));
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.message).toContain("1 schedule clash(es) detected");
        expect(response.count).toBe(1);
        expect(response.data.length).toBe(1);
        expect(response.data[0].message).toContain("CLASH DETECTED");
        // Validate clash object structure to kill ObjectLiteral mutations
        const clash = response.data[0];
        expect(clash).toHaveProperty('message');
        expect(clash).toHaveProperty('eventA');
        expect(clash).toHaveProperty('eventB');
        // Validate eventA structure
        expect(clash.eventA).toHaveProperty('title');
        expect(clash.eventA).toHaveProperty('timeline');
        expect(clash.eventA).toHaveProperty('starts');
        expect(clash.eventA).toHaveProperty('ends');
        expect(clash.eventA.title).toBe('Event A');
        expect(clash.eventA.timeline).toBe('Round 1');
        // Validate eventB structure
        expect(clash.eventB).toHaveProperty('title');
        expect(clash.eventB).toHaveProperty('timeline');
        expect(clash.eventB).toHaveProperty('starts');
        expect(clash.eventB).toHaveProperty('ends');
        expect(clash.eventB.title).toBe('Event B');
        expect(clash.eventB.timeline).toBe('Round 1');
    });

    it('should return success message when no clashes exist', async () => {
        setupIds();

        // Event A: 10:00 - 11:00
        // Event B: 12:00 - 13:00 (No overlap)
        const baseDate = new Date("2025-01-01");
        
        const events = [
            {
                _id: '1',
                title: 'Event A',
                timeline: [{ 
                    duration: { from: new Date(baseDate.setHours(10)), to: new Date(baseDate.setHours(11)) } 
                }]
            },
            {
                _id: '2',
                title: 'Event B',
                timeline: [{ 
                    duration: { from: new Date(baseDate.setHours(12)), to: new Date(baseDate.setHours(13)) } 
                }]
            }
        ];

        Event.find.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(events) })
        });

        await StudentController.GetClashDetectionWarnings(req, res);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: "No schedule clashes found in your registered events.",
            count: 0,
            data: []
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.message).toBe("No schedule clashes found in your registered events.");
        expect(response.count).toBe(0);
        expect(response.data).toEqual([]);
        expect(response.data.length).toBe(0);
    });

    it('should handle timeline entries with missing duration (Edge case coverage)', async () => {
        setupIds();

        const events = [
            {
                _id: '1',
                title: 'Event Broken',
                timeline: [
                    { title: 'TBD' } // Missing duration property entirely
                ]
            },
            {
                _id: '2',
                title: 'Event OK',
                timeline: [{ duration: { from: new Date(), to: new Date() } }]
            }
        ];

        Event.find.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(events) })
        });

        await StudentController.GetClashDetectionWarnings(req, res);

        // Should simply ignore the broken one and return 0 clashes
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: "No schedule clashes found in your registered events."
        }));
        const response = res.json.mock.calls[0][0];
        expect(response.message).toBe("No schedule clashes found in your registered events.");
    });

    it('should use default timeline title "Event Period" when entry.title is missing', async () => {
        setupIds();

        const baseDate = new Date("2025-01-01");
        const events = [
            {
                _id: '1',
                title: 'Event A',
                timeline: [{
                    // No title property - should default to "Event Period"
                    duration: {
                        from: new Date(baseDate.setHours(10,0,0)),
                        to: new Date(baseDate.setHours(12,0,0))
                    }
                }]
            },
            {
                _id: '2',
                title: 'Event B',
                timeline: [{
                    // No title - should also default to "Event Period"
                    duration: {
                        from: new Date(baseDate.setHours(11,0,0)),
                        to: new Date(baseDate.setHours(13,0,0))
                    }
                }]
            }
        ];

        Event.find.mockReturnValue({
            select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(events) })
        });

        await StudentController.GetClashDetectionWarnings(req, res);

        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(true);
        expect(response.count).toBe(1);
        // Both should have default timeline title
        expect(response.data[0].eventA.timeline).toBe("Event Period");
        expect(response.data[0].eventB.timeline).toBe("Event Period");
    });
    
    it('should not flag clash for the same event ID (Edge case coverage)', async () => {
         // If an event has multiple timeline entries overlapping with *itself*, it shouldn't clash
         setupIds();
         const baseDate = new Date();
         const events = [{
             _id: '1',
             title: 'Self Overlap',
             timeline: [
                 { duration: { from: baseDate, to: baseDate } },
                 { duration: { from: baseDate, to: baseDate } }
             ]
         }];

         Event.find.mockReturnValue({
             select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(events) })
         });

         await StudentController.GetClashDetectionWarnings(req, res);
         
         // The logic: if (isOverlap && slotA.eventId !== slotB.eventId)
         // Should return 0 clashes
         expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 0 }));
    });

    it('should return 500 on server error', async () => {
        StudentTeam.find.mockImplementation(() => { throw new Error("Fatal Error"); });
        await StudentController.GetClashDetectionWarnings(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Server error while detecting schedule clashes.",
            error: "Fatal Error"
        });
        const response = res.json.mock.calls[0][0];
        expect(response.success).toBe(false);
        expect(response.message).toBe("Server error while detecting schedule clashes.");
        expect(response.error).toBe("Fatal Error");
    });
});