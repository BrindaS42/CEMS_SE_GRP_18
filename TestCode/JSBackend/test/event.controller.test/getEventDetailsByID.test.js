import { jest } from '@jest/globals';
import { getEventDetailsByID } from '../../controllers/event_controllers/event.general.controller.js';
import Event from "../../models/event.model.js";
import SponsorAd from "../../models/sponsorad.model.js";

// Mock the Event model methods
Event.findById = jest.fn();
Event.find = jest.fn();

// Mock the SponsorAd model methods
SponsorAd.find = jest.fn();

describe('getEventDetailsByID', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { eventId: '123' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  // Helper to mock the Mongoose chain: findById -> populate... -> lean
  const mockChain = (result) => {
    const lean = jest.fn().mockResolvedValue(result);
    const populate = jest.fn().mockReturnThis();
    Event.findById.mockReturnValue({ populate, lean });
    return { lean, populate };
  };

  it('should return 404 if event not found', async () => {
    const { populate } = mockChain(null); // Event not found

    await getEventDetailsByID(req, res);

    // Verify all populate chains were called
    expect(populate).toHaveBeenCalledWith({
      path: "createdBy",
      populate: [{ path: "leader", select: "profile" }, { path: "members.user", select: "profile" }]
    });
    expect(populate).toHaveBeenCalledWith({ path: 'subEvents.subevent', select: 'title description timeline' });
    expect(populate).toHaveBeenCalledWith("ratings.by", "profile");
    expect(populate).toHaveBeenCalledWith({
      path: 'sponsors.sponsor',
      select: 'profile sponsorDetails email'
    });
    
    expect(res.status).toHaveBeenCalledWith(404);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Event not found");
  });

  it('should return event details without sponsors logic if sponsors array is empty', async () => {
    const mockEvent = { _id: '123', title: 'Test Event', sponsors: [] };
    mockChain(mockEvent);

    await getEventDetailsByID(req, res);

    expect(SponsorAd.find).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.event).toEqual(mockEvent);
  });

  it('should fetch and attach ads for approved sponsors', async () => {
    const sponsorId1 = 's1'; // Approved
    const sponsorId2 = 's2'; // Pending/Other
    
    const mockEvent = {
      _id: '123',
      sponsors: [
        { status: 'Approved', sponsor: { _id: sponsorId1 } }, 
        { status: 'Pending',  sponsor: { _id: sponsorId2 } }  
      ]
    };
    
    const mockAds = [{ sponsorId: sponsorId1, title: 'Ad 1', poster: 'img.jpg' }];

    mockChain(mockEvent);
    
    // Mock SponsorAd.find chain
    const leanMock = jest.fn().mockResolvedValue(mockAds);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    SponsorAd.find.mockReturnValue({ select: selectMock });

    await getEventDetailsByID(req, res);

    // 1. Check DB call was correct (only approved IDs)
    expect(SponsorAd.find).toHaveBeenCalledWith({
      sponsorId: { $in: [sponsorId1] },
      status: 'Published'
    });
    
    // 2. Verify select was called with correct fields
    expect(selectMock).toHaveBeenCalledWith('sponsorId poster title');
    expect(leanMock).toHaveBeenCalled();
    
    const responseEvent = res.json.mock.calls[0][0].event;

    // 3. Sponsor 1 should have ads
    expect(responseEvent.sponsors[0].sponsor.ads).toEqual([mockAds[0]]);

    // 4. Sponsor 2 (Pending) should have an EMPTY ARRAY (not undefined)
    // This matches your controller logic: || []
    expect(responseEvent.sponsors[1].sponsor.ads).toEqual([]); 
    
    // 5. Verify response structure
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(true);
  });

  it('should return 500 on DB error', async () => {
    const lean = jest.fn().mockRejectedValue(new Error('DB Fail'));
    Event.findById.mockReturnValue({ populate: jest.fn().mockReturnThis(), lean });

    await getEventDetailsByID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    const response = res.json.mock.calls[0][0];
    expect(response.success).toBe(false);
    expect(response.message).toBe("Failed to fetch event details");
    expect(response.error).toBe("DB Fail");
  });
});