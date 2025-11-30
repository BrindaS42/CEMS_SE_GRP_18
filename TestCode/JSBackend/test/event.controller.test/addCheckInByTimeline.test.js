import { jest } from '@jest/globals';
import { addCheckInByTimeline } from '../../controllers/event_controllers/event.general.controller.js';
import Registration from "../../models/registration.model.js";

// Mock the Registration model methods
Registration.findOne = jest.fn();
Registration.find = jest.fn();
Registration.prototype.save = jest.fn();

describe('addCheckInByTimeline', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { eventId: 'evt1' },
      body: { participantId: 'usr1', timelineTitle: 'Keynote', status: 'Present' }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('should return 404 if registration not found', async () => {
    Registration.findOne.mockResolvedValue(null);

    await addCheckInByTimeline(req, res);

    expect(Registration.findOne).toHaveBeenCalledWith({ eventId: 'evt1', userId: 'usr1' });
    expect(res.status).toHaveBeenCalledWith(404);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Participant not registered");
  });

  it('should update existing check-in status', async () => {
    const mockCheckIn = { timelineTitle: 'Keynote', status: 'Absent', checkedInAt: new Date() };
    const mockRegistration = {
      eventId: 'evt1',
      userId: 'usr1',
      checkIns: [mockCheckIn],
      save: jest.fn()
    };
    Registration.findOne.mockResolvedValue(mockRegistration);

    await addCheckInByTimeline(req, res);

    expect(mockCheckIn.status).toBe('Present'); // Status updated
    expect(mockCheckIn.checkedInAt).toBeInstanceOf(Date);
    expect(mockRegistration.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.message).toBe('Check-in Present for Keynote');
    expect(response.registration).toBe(mockRegistration);
  });

  it('should push new check-in if not found', async () => {
    const mockRegistration = {
      checkIns: [],
      save: jest.fn()
    };
    Registration.findOne.mockResolvedValue(mockRegistration);

    await addCheckInByTimeline(req, res);

    expect(mockRegistration.checkIns.length).toBe(1);
    expect(mockRegistration.checkIns[0]).toMatchObject({ timelineTitle: 'Keynote', status: 'Present' });
    expect(mockRegistration.checkIns[0].checkedInAt).toBeInstanceOf(Date);
    expect(mockRegistration.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.message).toBe('Check-in Present for Keynote');
  });

  it('should return 500 on error', async () => {
    Registration.findOne.mockRejectedValue(new Error('DB Error'));

    await addCheckInByTimeline(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to update check-in");
    expect(response.error).toBe("DB Error");
  });
});