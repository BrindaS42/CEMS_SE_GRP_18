import { jest } from '@jest/globals';
import { getRegistrationStatusByEIDPID } from '../../controllers/event_controllers/registration.controller.js';
import Registration from "../../models/registration.model.js";

// Mock the Registration model methods
Registration.findOne = jest.fn();
Registration.find = jest.fn();

describe('getRegistrationStatusByEIDPID Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { eventId: 'evt1', participantId: 'user1' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('should return 200 with status details if found', async () => {
        Registration.findOne.mockResolvedValue({
            status: 'confirmed',
            paymentStatus: 'completed',
            checkIns: []
        });

        await getRegistrationStatusByEIDPID(req, res);

        expect(Registration.findOne).toHaveBeenCalledWith({ eventId: 'evt1', userId: 'user1' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            registrationStatus: 'confirmed',
            paymentStatus: 'completed',
            checkIns: []
        });
    });

    test('should return 404 if registration not found', async () => {
        Registration.findOne.mockResolvedValue(null);

        await getRegistrationStatusByEIDPID(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Registration not found" });
    });

    test('should return 500 on DB error', async () => {
        Registration.findOne.mockRejectedValue(new Error('DB Error'));

        await getRegistrationStatusByEIDPID(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            success: false, 
            message: "Failed to fetch registration status", 
            error: "DB Error" 
        });
    });
});