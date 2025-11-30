import { jest } from '@jest/globals';
import { markCheckIn } from '../../controllers/event_controllers/registration.controller.js';
import Registration from "../../models/registration.model.js";

// Mock the Registration model methods
Registration.findOne = jest.fn();
Registration.find = jest.fn();
Registration.prototype.save = jest.fn();

describe('markCheckIn Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { 
            body: { checkInCode: 'ABC12', timelineRef: 'tl_1' } 
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('should return 200 and mark present if code and timeline match', async () => {
        const mockCheckInObj = {
            timelineRef: 'tl_1',
            status: 'absent',
            checkedInAt: null
        };
        
        const mockRegistration = {
            checkIns: [mockCheckInObj],
            save: jest.fn().mockResolvedValue(true)
        };

        // Need to handle toString() on timelineRef in the find() logic
        // Since we are mocking the object, we just ensure the array search logic in controller works
        // The controller does: c.timelineRef.toString() === timelineRef
        // So our mock object's timelineRef needs a toString method or be a string (if the controller code allows string comparison, 
        // but Mongoose ObjectIds usually need .toString()).
        // Hack: Just make timelineRef a string in mock, but ensure the controller logic passes.
        // Controller: `c.timelineRef.toString() === timelineRef`
        // If we pass a string 'tl_1', 'tl_1'.toString() is 'tl_1'.
        
        Registration.findOne.mockResolvedValue(mockRegistration);

        await markCheckIn(req, res);

        expect(mockCheckInObj.status).toBe('present');
        expect(mockCheckInObj.checkedInAt).toBeInstanceOf(Date);
        expect(mockRegistration.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ 
            success: true, 
            message: "Check-in marked successfully", 
            registration: mockRegistration 
        });
    });

    test('should return 404 if checkInCode is invalid', async () => {
        Registration.findOne.mockResolvedValue(null);

        await markCheckIn(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid check-in code" });
    });

    test('should return 404 if timelineRef is not found in checkIns', async () => {
        const mockRegistration = {
            checkIns: [{ timelineRef: 'other_tl' }], // Mismatch
            save: jest.fn()
        };
        Registration.findOne.mockResolvedValue(mockRegistration);

        await markCheckIn(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ success: false, message: "Timeline event not found for this registration." });
        expect(mockRegistration.save).not.toHaveBeenCalled();
    });

    test('should return 500 on DB error', async () => {
        Registration.findOne.mockRejectedValue(new Error('DB Error'));

        await markCheckIn(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ 
            success: false, 
            message: "Failed to mark check-in", 
            error: "DB Error" 
        });
    });
});