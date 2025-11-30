import { jest } from '@jest/globals';
import { getListOfAllEvents } from '../../controllers/event_controllers/event.general.controller.js';
import Event from "../../models/event.model.js";

// Mock the Event model methods
Event.aggregate = jest.fn();
Event.countDocuments = jest.fn();
Event.find = jest.fn();

describe('getListOfAllEvents', () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should fetch events with default pagination and no filters', async () => {
    const mockEvents = [{ title: 'Event 1' }];
    // Mock aggregate chain
    Event.aggregate.mockResolvedValue(mockEvents);
    Event.countDocuments.mockResolvedValue(1);

    await getListOfAllEvents(req, res);

    // Verify complete aggregation pipeline structure
    expect(Event.aggregate).toHaveBeenCalledWith([
      { $match: { status: "published" } },
      {
        $addFields: {
          registrationCount: { $size: "$registrations" }
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: 0 },
      { $limit: 12 },
      { $project: { title: 1, description: 1, categoryTags: 1, venue: 1, timeline: 1, gallery: 1, registrationCount: 1, createdAt: 1 } }
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: mockEvents,
      pagination: { page: 1, pages: 1, total: 1 }
    });
  });

  it('should filter by search term', async () => {
    req.query.search = 'Hackathon';
    Event.aggregate.mockResolvedValue([]);
    Event.countDocuments.mockResolvedValue(0);

    await getListOfAllEvents(req, res);

    // Verify regex was added to match
    const matchStage = Event.aggregate.mock.calls[0][0][0].$match;
    expect(matchStage.title).toEqual({ $regex: 'Hackathon', $options: 'i' });
  });

  it('should filter by categoryTags (single string)', async () => {
    req.query.categoryTags = 'Tech';
    Event.aggregate.mockResolvedValue([]);
    Event.countDocuments.mockResolvedValue(0);

    await getListOfAllEvents(req, res);

    const pipeline = Event.aggregate.mock.calls[0][0];
    const matchStage = pipeline[0].$match;
    expect(matchStage.categoryTags).toEqual({ $in: ['Tech'] });
    expect(matchStage.status).toBe('published');
    
    // Verify the pipeline has all required stages
    expect(pipeline[1].$addFields.registrationCount).toEqual({ $size: "$registrations" });
    expect(pipeline[2].$sort.createdAt).toBe(-1);
  });

  it('should filter by categoryTags (array)', async () => {
    req.query.categoryTags = ['Tech', 'Music'];
    Event.aggregate.mockResolvedValue([]);
    Event.countDocuments.mockResolvedValue(0);

    await getListOfAllEvents(req, res);

    const matchStage = Event.aggregate.mock.calls[0][0][0].$match;
    expect(matchStage.categoryTags).toEqual({ $in: ['Tech', 'Music'] });
  });

  it('should not add categoryTags filter if tags array is empty', async () => {
    req.query.categoryTags = '';
    Event.aggregate.mockResolvedValue([]);
    Event.countDocuments.mockResolvedValue(0);

    await getListOfAllEvents(req, res);

    const matchStage = Event.aggregate.mock.calls[0][0][0].$match;
    expect(matchStage.categoryTags).toBeUndefined();
    expect(matchStage.status).toBe('published');
  });

  it('should handle pagination calculation', async () => {
    req.query.page = '2';
    req.query.limit = '10';
    Event.aggregate.mockResolvedValue([]);
    Event.countDocuments.mockResolvedValue(25); // 25 items, limit 10 => 3 pages

    await getListOfAllEvents(req, res);

    // Verify skip and limit calculations
    const pipeline = Event.aggregate.mock.calls[0][0];
    expect(pipeline[3].$skip).toBe(10); // (2-1) * 10
    expect(pipeline[4].$limit).toBe(10);
    
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [],
      pagination: { page: 2, pages: 3, total: 25 }
    });
  });

  it('should return 500 if aggregation fails', async () => {
    Event.aggregate.mockRejectedValue(new Error('DB Error'));

    await getListOfAllEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to fetch events");
    expect(response.error).toBe("DB Error");
  });
});