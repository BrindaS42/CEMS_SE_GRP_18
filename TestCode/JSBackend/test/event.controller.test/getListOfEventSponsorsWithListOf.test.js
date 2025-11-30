import { jest } from '@jest/globals';
import { getListOfEventSponsorsWithListOf } from '../../controllers/event_controllers/event.general.controller.js';
import Event from "../../models/event.model.js";

// Mock the Event model methods
Event.findById = jest.fn();
Event.find = jest.fn();

describe('getListOfEventSponsorsWithListOf', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { eventId: '1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should return sponsors if event exists', async () => {
    const mockEvent = { sponsors: [{ name: 'S1' }] };
    const selectMock = jest.fn().mockResolvedValue(mockEvent);
    Event.findById.mockReturnValue({ select: selectMock });

    await getListOfEventSponsorsWithListOf(req, res);

    expect(Event.findById).toHaveBeenCalledWith('1');
    expect(selectMock).toHaveBeenCalledWith("sponsors");
    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.sponsors).toEqual(mockEvent.sponsors);
  });

  it('should return 404 if event not found', async () => {
    Event.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });

    await getListOfEventSponsorsWithListOf(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Event not found");
  });

  it('should return 500 on error', async () => {
    Event.findById.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error('Fail')) });

    await getListOfEventSponsorsWithListOf(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to fetch sponsors");
    expect(response.error).toBe("Fail");
  });
});