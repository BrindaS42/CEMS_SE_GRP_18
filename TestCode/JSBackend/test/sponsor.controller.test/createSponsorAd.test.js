import { jest } from '@jest/globals';
import { createSponsorAd } from '../../controllers/sponsor_controllers/sponsorAd.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";

// Mock the SponsorAd model methods
SponsorAd.create = jest.fn();
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();

describe('createSponsorAd Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks and request/response objects before each test
    jest.clearAllMocks();
    req = {
      user: { id: 'user123' },
      body: {
        title: 'Test Ad',
        description: 'Description',
        address: '123 St',
        contact: '555-5555',
        poster: 'poster-url'
        // Intentionally leaving out images/videos to test default || []
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should create a new ad and return 201', async () => {
    const mockAd = { ...req.body, _id: 'ad123', status: 'Drafted' };
    
    // Mock the create method to resolve successfully
    SponsorAd.create.mockResolvedValue(mockAd);

    await createSponsorAd(req, res);

    // Verify SponsorAd.create was called with correct data including defaults
    expect(SponsorAd.create).toHaveBeenCalledWith({
      sponsorId: 'user123',
      title: 'Test Ad',
      description: 'Description',
      images: [], // Checks the || [] logic
      videos: [], // Checks the || [] logic
      address: '123 St',
      contact: '555-5555',
      poster: 'poster-url',
      status: 'Drafted'
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Ad created", ad: mockAd });
  });

  it('should return 500 if database creation fails', async () => {
    const errorMessage = 'Database error';
    SponsorAd.create.mockRejectedValue(new Error(errorMessage));

    await createSponsorAd(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
  });
});