import { jest } from '@jest/globals';
import { updateSponsorAd } from '../../controllers/sponsor_controllers/sponsorAd.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";

// Mock the SponsorAd model methods
SponsorAd.findOneAndUpdate = jest.fn();
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();

describe('updateSponsorAd Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { id: 'ad123' },
      user: { id: 'user123' },
      body: { title: 'Updated Title' }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should update the ad and return 200', async () => {
    const mockUpdatedAd = { _id: 'ad123', title: 'Updated Title' };
    SponsorAd.findOneAndUpdate.mockResolvedValue(mockUpdatedAd);

    await updateSponsorAd(req, res);

    expect(SponsorAd.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'ad123', sponsorId: 'user123' },
      req.body,
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedAd);
  });

  it('should return 404 if ad is not found or unauthorized', async () => {
    SponsorAd.findOneAndUpdate.mockResolvedValue(null);

    await updateSponsorAd(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Ad not found or unauthorized" });
  });

  it('should return 500 on database error', async () => {
    SponsorAd.findOneAndUpdate.mockRejectedValue(new Error('Update failed'));

    await updateSponsorAd(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Update failed' });
  });
});