import { jest } from '@jest/globals';
import { getListOfRatingReviewByEID } from '../../controllers/event_controllers/event.general.controller.js';
import Event from "../../models/event.model.js";

// Mock the Event model methods
Event.findById = jest.fn();
Event.find = jest.fn();

describe('getListOfRatingReviewByEID', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { eventId: '1' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('should fetch reviews successfully', async () => {
    const mockEvent = { ratings: [{ rating: 5 }] };
    const populateMock = jest.fn().mockResolvedValue(mockEvent);
    Event.findById.mockReturnValue({ populate: populateMock });

    await getListOfRatingReviewByEID(req, res);

    expect(Event.findById).toHaveBeenCalledWith('1');
    expect(populateMock).toHaveBeenCalledWith("ratings.by", "profile");
    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.reviews).toEqual(mockEvent.ratings);
  });

  it('should return 500 on error', async () => {
    Event.findById.mockImplementation(() => { throw new Error("DB fail"); });

    await getListOfRatingReviewByEID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to fetch reviews");
    expect(response.error).toBe("DB fail");
  });
});