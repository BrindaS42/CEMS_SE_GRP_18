import { jest } from '@jest/globals';
import { publishSponsorAd } from '../../controllers/sponsor_controllers/sponsorAd.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";

// Mock the SponsorAd model methods
SponsorAd.findOne = jest.fn();
SponsorAd.findByIdAndUpdate = jest.fn();
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();

describe('publishSponsorAd Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { id: 'ad123' },
      user: { id: 'user123' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should publish the ad and return 200', async () => {
    // Mock the ad document instance with a save method
    const mockAdInstance = {
      _id: 'ad123',
      sponsorId: 'user123',
      status: 'Drafted',
      save: jest.fn().mockResolvedValue(true) // Mock save success
    };

    SponsorAd.findOne.mockResolvedValue(mockAdInstance);

    await publishSponsorAd(req, res);

    // Verify findOne called correctly
    expect(SponsorAd.findOne).toHaveBeenCalledWith({
      _id: 'ad123',
      sponsorId: 'user123',
    });

    // Verify status was changed locally
    expect(mockAdInstance.status).toBe("Published");

    // Verify .save() was called
    expect(mockAdInstance.save).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Ad published", ad: mockAdInstance });
  });

  it('should return 404 if ad not found', async () => {
    SponsorAd.findOne.mockResolvedValue(null);

    await publishSponsorAd(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Ad not found or unauthorized" });
  });

  it('should return 500 if finding the ad fails', async () => {
    SponsorAd.findOne.mockRejectedValue(new Error('Find failed'));

    await publishSponsorAd(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Find failed' });
  });
  
  it('should return 500 if saving the ad fails', async () => {
      // This ensures 100% coverage of the catch block even if find succeeds but save fails
      const mockAdInstance = {
        _id: 'ad123',
        status: 'Drafted',
        save: jest.fn().mockRejectedValue(new Error('Save failed'))
      };
  
      SponsorAd.findOne.mockResolvedValue(mockAdInstance);
  
      await publishSponsorAd(req, res);
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Save failed' });
    });
});