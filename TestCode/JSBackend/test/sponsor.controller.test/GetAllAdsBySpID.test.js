import { jest } from '@jest/globals';
import { GetAllAdsBySpID } from '../../controllers/sponsor_controllers/sponsor.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";

// Mock the SponsorAd model methods
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();

describe('GetAllAdsBySpID', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { sponsorId: '123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 200 and ads list on success', async () => {
    const mockAds = [{ title: 'Ad 1' }];
    SponsorAd.find.mockResolvedValue(mockAds);

    await GetAllAdsBySpID(req, res);

    expect(SponsorAd.find).toHaveBeenCalledWith({ sponsorId: '123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAds);
  });

  it('should return 500 on database error', async () => {
    const mockError = new Error('DB Error');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    SponsorAd.find.mockRejectedValue(mockError);

    await GetAllAdsBySpID(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch sponsor ads" });
    
    consoleSpy.mockRestore();
  });
});