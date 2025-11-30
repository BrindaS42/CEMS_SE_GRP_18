import { jest } from '@jest/globals';
import { getAnnouncementsByEID } from '../../controllers/event_controllers/event.general.controller.js';
import Event from "../../models/event.model.js";

// Mock the Event model methods
Event.findById = jest.fn();
Event.find = jest.fn();

describe('getAnnouncementsByEID', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { eventId: '1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('should return announcements if event exists', async () => {
    const mockEvent = { announcements: ['A1', 'A2'] };
    const selectMock = jest.fn().mockResolvedValue(mockEvent);
    Event.findById.mockReturnValue({ select: selectMock });

    await getAnnouncementsByEID(req, res);

    expect(Event.findById).toHaveBeenCalledWith('1');
    expect(selectMock).toHaveBeenCalledWith("announcements");
    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.announcements).toEqual(['A1', 'A2']);
  });

  it('should return empty array if event has no announcements field', async () => {
    const mockEvent = {}; // announcements undefined
    Event.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockEvent) });

    await getAnnouncementsByEID(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.announcements).toEqual([]);
  });

  it('should return 404 if event not found', async () => {
    Event.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await getAnnouncementsByEID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Event not found");
  });

  it('should return 500 on error', async () => {
    Event.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('Fail')) });

    await getAnnouncementsByEID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to fetch announcements");
    expect(response.error).toBe("Fail");
  });
});