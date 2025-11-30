import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getEventWiseRatings } from '../../controllers/organizer_controllers/analytics.controller.js';
import Event from '../../models/event.model.js';
import Team from '../../models/organizerTeam.model.js';

jest.mock('../../models/event.model.js');
jest.mock('../../models/organizerTeam.model.js');

describe('Analytics Controller - getEventWiseRatings', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { id: 'user123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    // Setup mock methods
    Team.find = jest.fn();
    Event.find = jest.fn();
    
    jest.clearAllMocks();
  });

  // Test: No teams found for user
  it('should return empty array when user has no teams', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    await getEventWiseRatings(req, res);

    expect(Team.find).toHaveBeenCalledWith({
      $or: [
        { leader: 'user123' },
        { "members.user": 'user123', "members.status": "Approved" }
      ],
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  // Test: User has teams but no events with ratings
  it('should return empty array when teams have no events with ratings', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'team1' },
          { _id: 'team2' }
        ])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    await getEventWiseRatings(req, res);

    expect(Event.find).toHaveBeenCalledWith({
      createdBy: { $in: ['team1', 'team2'] },
      'ratings.0': { $exists: true }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  // Test: Single event with ratings
  it('should return ratings data for single event with ratings', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    const eventSelectMock = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        {
          _id: 'event1',
          title: 'Tech Conference',
          ratings: [
            { rating: 5 },
            { rating: 4 },
            { rating: 5 }
          ]
        }
      ])
    });

    Event.find.mockReturnValue({
      select: eventSelectMock
    });

    await getEventWiseRatings(req, res);

    // Verify that select is called with 'title ratings' fields
    expect(eventSelectMock).toHaveBeenCalledWith('title ratings');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        name: 'Tech Conference',
        rating: 4.7
      }
    ]);
  });

  // Test: Multiple events with different ratings
  it('should calculate and return ratings for multiple events', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'event1',
            title: 'Tech Conference',
            ratings: [{ rating: 5 }, { rating: 4 }, { rating: 5 }]
          },
          {
            _id: 'event2',
            title: 'Hackathon',
            ratings: [{ rating: 3 }, { rating: 4 }]
          },
          {
            _id: 'event3',
            title: 'Workshop',
            ratings: [{ rating: 5 }]
          }
        ])
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const ratingsData = res.json.mock.calls[0][0];
    
    expect(ratingsData).toHaveLength(3);
    expect(ratingsData[0]).toEqual({ name: 'Tech Conference', rating: 4.7 });
    expect(ratingsData[1]).toEqual({ name: 'Hackathon', rating: 3.5 });
    expect(ratingsData[2]).toEqual({ name: 'Workshop', rating: 5.0 });
  });

  // Test: Event with single rating
  it('should handle event with single rating correctly', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'event1',
            title: 'Single Rating Event',
            ratings: [{ rating: 4.5 }]
          }
        ])
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        name: 'Single Rating Event',
        rating: 4.5
      }
    ]);
  });

  // Test: Decimal ratings calculation
  it('should calculate decimal ratings correctly', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'event1',
            title: 'Event with decimals',
            ratings: [
              { rating: 4.7 },
              { rating: 4.3 },
              { rating: 4.5 }
            ]
          }
        ])
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const ratingsData = res.json.mock.calls[0][0];
    expect(ratingsData[0].rating).toBe(4.5);
  });

  // Test: Rating rounding behavior
  it('should round ratings to 1 decimal place', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'event1',
            title: 'Rounding Test',
            ratings: [
              { rating: 3.33 },
              { rating: 3.33 },
              { rating: 3.33 }
            ]
          }
        ])
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const ratingsData = res.json.mock.calls[0][0];
    expect(ratingsData[0].rating).toBe(3.3);
  });

  // Test: Very low ratings
  it('should handle very low ratings correctly', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'event1',
            title: 'Low Rated Event',
            ratings: [{ rating: 0 }, { rating: 0 }]
          }
        ])
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        name: 'Low Rated Event',
        rating: 0.0
      }
    ]);
  });

  // Test: Error handling - Team.find fails
  it('should handle errors when Team.find fails', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database error'))
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to fetch event-wise ratings',
      error: 'Database error'
    });
  });

  // Test: Error handling - Event.find fails
  it('should handle errors when Event.find fails', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Event query failed'))
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to fetch event-wise ratings',
      error: 'Event query failed'
    });
  });

  // Test: Multiple teams for user
  it('should fetch events from all user teams', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'team1' },
          { _id: 'team2' },
          { _id: 'team3' }
        ])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'event1',
            title: 'Multi-team Event',
            ratings: [{ rating: 4 }]
          }
        ])
      })
    });

    await getEventWiseRatings(req, res);

    expect(Event.find).toHaveBeenCalledWith({
      createdBy: { $in: ['team1', 'team2', 'team3'] },
      'ratings.0': { $exists: true }
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Test: Large number of events
  it('should handle large number of events correctly', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    const events = [];
    for (let i = 0; i < 50; i++) {
      events.push({
        _id: `event${i}`,
        title: `Event ${i}`,
        ratings: [{ rating: 4 }, { rating: 5 }]
      });
    }

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(events)
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    const ratingsData = res.json.mock.calls[0][0];
    expect(ratingsData).toHaveLength(50);
    ratingsData.forEach(data => {
      expect(data.rating).toBe(4.5);
    });
  });

  // Test: Verify userId extraction
  it('should correctly extract userId from req.user.id', async () => {
    req.user.id = 'specificUser456';

    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    await getEventWiseRatings(req, res);

    expect(Team.find).toHaveBeenCalledWith({
      $or: [
        { leader: 'specificUser456' },
        { "members.user": 'specificUser456', "members.status": "Approved" }
      ],
    });
  });

  // Test: Ratings reduce accumulator
  it('should accumulate ratings correctly using reduce', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'event1',
            title: 'Accumulator Test',
            ratings: [
              { rating: 1 },
              { rating: 2 },
              { rating: 3 },
              { rating: 4 },
              { rating: 5 }
            ]
          }
        ])
      })
    });

    await getEventWiseRatings(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      {
        name: 'Accumulator Test',
        rating: 3.0
      }
    ]);
  });
});
