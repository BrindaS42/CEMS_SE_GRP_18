import { jest } from '@jest/globals';
import { addRatingReviewByEID } from '../../controllers/event_controllers/event.general.controller.js';
import Event from "../../models/event.model.js";

// Mock the Event model methods
Event.findById = jest.fn();
Event.find = jest.fn();
Event.prototype.save = jest.fn();

describe('addRatingReviewByEID', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { eventId: 'evt1' },
      body: { rating: 5, review: 'Great!' },
      user: { id: 'user123' }
    };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  it('should return 404 if event not found', async () => {
    Event.findById.mockResolvedValue(null);

    await addRatingReviewByEID(req, res);

    expect(Event.findById).toHaveBeenCalledWith('evt1');
    expect(res.status).toHaveBeenCalledWith(404);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Event not found");
  });

  it('should return 400 if user already rated', async () => {
    const mockEvent = {
      ratings: [{ by: { toString: () => 'user123' } }] // same ID as req.user.id
    };
    Event.findById.mockResolvedValue(mockEvent);

    await addRatingReviewByEID(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("You already submitted a review");
  });

  it('should successfully add a review', async () => {
    const mockEvent = {
      ratings: [{ by: { toString: () => 'otherUser' } }],
      save: jest.fn()
    };
    Event.findById.mockResolvedValue(mockEvent);

    await addRatingReviewByEID(req, res);

    expect(mockEvent.ratings.length).toBe(2);
    expect(mockEvent.ratings[1]).toMatchObject({ by: 'user123', rating: 5, review: 'Great!' });
    expect(mockEvent.ratings[1].createdAt).toBeInstanceOf(Date);
    expect(mockEvent.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.message).toBe("Review added successfully");
    expect(response.ratings).toBe(mockEvent.ratings);
  });

  it('should return 500 on error', async () => {
    Event.findById.mockRejectedValue(new Error('Fail'));

    await addRatingReviewByEID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to add review");
    expect(response.error).toBe("Fail");
  });
});