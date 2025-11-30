import { jest, describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { getDashboardStats } from '../../controllers/organizer_controllers/analytics.controller.js';
import Event from '../../models/event.model.js';
import Team from '../../models/organizerTeam.model.js';
import Registration from '../../models/registration.model.js';

jest.mock('../../models/event.model.js');
jest.mock('../../models/organizerTeam.model.js');
jest.mock('../../models/registration.model.js');

describe('Analytics Controller - getDashboardStats', () => {
  let req, res, consoleLogSpy;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
  });

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
    Registration.countDocuments = jest.fn();
    
    jest.clearAllMocks();
  });

  // Test: No teams found for user
  it('should return zero stats when user has no teams', async () => {
    const selectMock = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([])
    });
    
    Team.find.mockReturnValue({
      select: selectMock
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    Registration.countDocuments.mockResolvedValue(0);

    await getDashboardStats(req, res);

    expect(Team.find).toHaveBeenCalledWith({
      $or: [
        { leader: 'user123' },
        { "members.user": 'user123', "members.status": "Approved" }
      ],
    });
    
    // Verify that select is called with "_id" to select only team IDs
    expect(selectMock).toHaveBeenCalledWith("_id");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 0,
      totalRegistrations: 0,
      avgAttendance: 89,
      avgRating: 0,
    });
  });

  // Test: User has teams but no events
  it('should return zero stats when teams have no events', async () => {
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

    Registration.countDocuments.mockResolvedValue(0);

    await getDashboardStats(req, res);

    expect(Event.find).toHaveBeenCalledWith({
      createdBy: { $in: ['team1', 'team2'] }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 0,
      totalRegistrations: 0,
      avgAttendance: 89,
      avgRating: 0,
    });
  });

  // Test: Events with no ratings
  it('should return correct stats for events with no ratings', async () => {
    const mockEventId1 = 'event1';
    const mockEventId2 = 'event2';

    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    const eventSelectMock = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue([
        { _id: mockEventId1, status: 'active', ratings: [], registrations: [] },
        { _id: mockEventId2, status: 'completed', ratings: [], registrations: [] }
      ])
    });

    Event.find.mockReturnValue({
      select: eventSelectMock
    });

    Registration.countDocuments.mockResolvedValue(25);

    await getDashboardStats(req, res);

    // Verify that select is called with correct fields
    expect(eventSelectMock).toHaveBeenCalledWith('status ratings registrations');

    expect(Registration.countDocuments).toHaveBeenCalledWith({
      eventId: { $in: [mockEventId1, mockEventId2] }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 2,
      totalRegistrations: 25,
      avgAttendance: 89,
      avgRating: 0,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Dashboard Stats - Events: 2, Registrations: 25, Avg Attendance: 89, Avg Rating: 0'
    );
  });

  // Test: Events with ratings
  it('should calculate average rating correctly for events with ratings', async () => {
    const mockEventId1 = 'event1';
    const mockEventId2 = 'event2';

    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: mockEventId1,
            status: 'completed',
            ratings: [
              { rating: 5 },
              { rating: 4 },
              { rating: 5 }
            ],
            registrations: []
          },
          {
            _id: mockEventId2,
            status: 'completed',
            ratings: [
              { rating: 3 },
              { rating: 4 }
            ],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(50);

    await getDashboardStats(req, res);

    // Event 1 avg: (5+4+5)/3 = 4.666...
    // Event 2 avg: (3+4)/2 = 3.5
    // Overall avg: (4.666... + 3.5)/2 = 4.083... => 4.1
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 2,
      totalRegistrations: 50,
      avgAttendance: 89,
      avgRating: '4.1',
    });
  });

  // Test: Single event with single rating
  it('should handle single event with single rating', async () => {
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
            status: 'completed',
            ratings: [{ rating: 5 }],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(10);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 1,
      totalRegistrations: 10,
      avgAttendance: 89,
      avgRating: '5.0',
    });
  });

  // Test: Mixed events - some with ratings, some without
  it('should calculate average only for events with ratings', async () => {
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
            status: 'completed',
            ratings: [{ rating: 4 }, { rating: 4 }],
            registrations: []
          },
          {
            _id: 'event2',
            status: 'active',
            ratings: [],
            registrations: []
          },
          {
            _id: 'event3',
            status: 'completed',
            ratings: [{ rating: 2 }, { rating: 2 }],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(30);

    await getDashboardStats(req, res);

    // Event 1 avg: (4+4)/2 = 4.0
    // Event 2: no ratings (skipped)
    // Event 3 avg: (2+2)/2 = 2.0
    // Overall avg: (4.0 + 2.0)/2 = 3.0
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 3,
      totalRegistrations: 30,
      avgAttendance: 89,
      avgRating: '3.0',
    });
  });

  // Test: Events with undefined ratings property
  it('should handle events with undefined ratings property', async () => {
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
            status: 'active',
            registrations: []
          },
          {
            _id: 'event2',
            status: 'completed',
            ratings: [{ rating: 3 }],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(15);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 2,
      totalRegistrations: 15,
      avgAttendance: 89,
      avgRating: '3.0',
    });
  });

  // Test: Events with zero registrations
  it('should handle zero registrations', async () => {
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
            status: 'draft',
            ratings: [],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(0);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 1,
      totalRegistrations: 0,
      avgAttendance: 89,
      avgRating: 0,
    });
  });

  // Test: Large number of events and registrations
  it('should handle large numbers correctly', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    const events = [];
    for (let i = 0; i < 100; i++) {
      events.push({
        _id: `event${i}`,
        status: 'completed',
        ratings: [{ rating: 4 }, { rating: 5 }],
        registrations: []
      });
    }

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(events)
      })
    });

    Registration.countDocuments.mockResolvedValue(5000);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 100,
      totalRegistrations: 5000,
      avgAttendance: 89,
      avgRating: '4.5',
    });
  });

  // Test: Ratings with decimal values
  it('should handle decimal rating values correctly', async () => {
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
            status: 'completed',
            ratings: [
              { rating: 4.7 },
              { rating: 4.3 },
              { rating: 4.5 }
            ],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(20);

    await getDashboardStats(req, res);

    // Event avg: (4.7+4.3+4.5)/3 = 13.5/3 = 4.5
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 1,
      totalRegistrations: 20,
      avgAttendance: 89,
      avgRating: '4.5',
    });
  });

  // Test: Error handling - Team.find fails
  it('should handle errors when Team.find fails', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      })
    });

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to fetch dashboard stats',
      error: 'Database connection failed'
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

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to fetch dashboard stats',
      error: 'Event query failed'
    });
  });

  // Test: Error handling - Registration.countDocuments fails
  it('should handle errors when Registration.countDocuments fails', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'event1', status: 'active', ratings: [], registrations: [] }
        ])
      })
    });

    Registration.countDocuments.mockRejectedValue(new Error('Count failed'));

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Failed to fetch dashboard stats',
      error: 'Count failed'
    });
  });

  // Test: Multiple teams for a user (leader and member)
  it('should fetch events from all teams where user is leader or approved member', async () => {
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
            status: 'active',
            ratings: [{ rating: 5 }],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(10);

    await getDashboardStats(req, res);

    expect(Event.find).toHaveBeenCalledWith({
      createdBy: { $in: ['team1', 'team2', 'team3'] }
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Test: Verify console.log is called with correct format
  it('should log dashboard stats in correct format', async () => {
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
            status: 'completed',
            ratings: [{ rating: 4 }, { rating: 4 }],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(42);

    await getDashboardStats(req, res);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Dashboard Stats - Events: 1, Registrations: 42, Avg Attendance: 89, Avg Rating: 4.0'
    );
  });

  // Test: Extreme edge case - very low rating
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
            status: 'completed',
            ratings: [{ rating: 0 }, { rating: 0 }],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(5);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 1,
      totalRegistrations: 5,
      avgAttendance: 89,
      avgRating: '0.0',
    });
  });

  // Test: Rounding behavior for avgRating
  it('should round avgRating to 1 decimal place correctly', async () => {
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
            status: 'completed',
            ratings: [{ rating: 3.33 }, { rating: 3.33 }, { rating: 3.33 }],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(12);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 1,
      totalRegistrations: 12,
      avgAttendance: 89,
      avgRating: '3.3',
    });
  });

  // Test: Empty ratings array vs no ratings property
  it('should handle empty ratings array same as no ratings', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { _id: 'event1', status: 'active', ratings: [] }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(0);

    await getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 1,
      totalRegistrations: 0,
      avgAttendance: 89,
      avgRating: 0,
    });
  });

  // Test: User ID extraction from req.user.id
  it('should correctly extract userId from req.user.id', async () => {
    req.user.id = 'specificUserId789';

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

    Registration.countDocuments.mockResolvedValue(0);

    await getDashboardStats(req, res);

    expect(Team.find).toHaveBeenCalledWith({
      $or: [
        { leader: 'specificUserId789' },
        { "members.user": 'specificUserId789', "members.status": "Approved" }
      ],
    });
  });

  // Test: Ratings reduce accumulator behavior
  it('should accumulate ratings correctly in reduce function', async () => {
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
            status: 'completed',
            ratings: [
              { rating: 1 },
              { rating: 2 },
              { rating: 3 },
              { rating: 4 },
              { rating: 5 }
            ],
            registrations: []
          }
        ])
      })
    });

    Registration.countDocuments.mockResolvedValue(100);

    await getDashboardStats(req, res);

    // (1+2+3+4+5)/5 = 15/5 = 3.0
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      totalEvents: 1,
      totalRegistrations: 100,
      avgAttendance: 89,
      avgRating: '3.0',
    });
  });

  // Test: avgAttendance is always 89 (mock value)
  it('should always return avgAttendance as 89', async () => {
    Team.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'team1' }])
      })
    });

    Event.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      })
    });

    Registration.countDocuments.mockResolvedValue(0);

    await getDashboardStats(req, res);

    const responseData = res.json.mock.calls[0][0];
    expect(responseData.avgAttendance).toBe(89);
  });
});
