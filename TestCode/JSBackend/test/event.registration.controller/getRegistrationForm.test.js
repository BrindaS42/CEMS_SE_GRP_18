import { jest } from '@jest/globals';
import { getRegistrationForm } from '../../controllers/event_controllers/registration.controller.js';
import Event from "../../models/event.model.js";

// Mock the Event model methods
Event.findById = jest.fn();
Event.find = jest.fn();

describe('getRegistrationForm Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { eventId: 'event123' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('should return 200 and event config when event exists', async () => {
        const mockEvent = {
            title: 'Hackathon',
            config: { registrationType: 'Individual' }
        };

        // Mock chaining: Event.findById().select()
        Event.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockEvent)
        });

        await getRegistrationForm(req, res);

        expect(Event.findById).toHaveBeenCalledWith('event123');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            eventTitle: 'Hackathon',
            registrationConfig: { registrationType: 'Individual' },
        });
    });

    test('should return 200 with empty config if config is missing', async () => {
        const mockEvent = { title: 'Hackathon' }; // No config

        Event.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockEvent)
        });

        await getRegistrationForm(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            registrationConfig: {}
        }));
    });

    test('should return 404 if event is not found', async () => {
        Event.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        await getRegistrationForm(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Event not found" });
    });

    test('should return 500 if database fails', async () => {
        Event.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error('DB Error'))
        });

        await getRegistrationForm(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Failed to fetch registration form",
            error: "DB Error"
        });
    });
});