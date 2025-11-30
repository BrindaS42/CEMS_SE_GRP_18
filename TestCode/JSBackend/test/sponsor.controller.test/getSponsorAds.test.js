import { jest } from '@jest/globals';
import { getSponsorAds } from '../../controllers/sponsor_controllers/sponsorAd.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";

// Mock the SponsorAd model methods
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();

describe('getSponsorAds', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { user: { id: 'user123' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return all ads for the user and status 200', async () => {
    const mockAds = [{ title: 'Ad 1' }, { title: 'Ad 2' }];
    SponsorAd.find.mockResolvedValue(mockAds);

    await getSponsorAds(req, res);

    expect(SponsorAd.find).toHaveBeenCalledWith({ sponsorId: 'user123' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAds);
  });

  it('should return 500 if database fails', async () => {
    SponsorAd.find.mockRejectedValue(new Error('DB Error'));

    await getSponsorAds(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB Error' });
  });
});