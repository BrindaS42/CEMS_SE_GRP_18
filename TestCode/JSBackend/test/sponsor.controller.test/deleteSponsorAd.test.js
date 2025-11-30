import { jest } from '@jest/globals';
import { deleteSponsorAd } from '../../controllers/sponsor_controllers/sponsorAd.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";

// Mock the SponsorAd model methods
SponsorAd.findOneAndDelete = jest.fn();
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();

describe('deleteSponsorAd Controller', () => {
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

  it('should delete the ad and return 200', async () => {
    const mockDeletedAd = { _id: 'ad123', title: 'ToBeDeleted' };
    SponsorAd.findOneAndDelete.mockResolvedValue(mockDeletedAd);

    await deleteSponsorAd(req, res);

    expect(SponsorAd.findOneAndDelete).toHaveBeenCalledWith({
      _id: 'ad123',
      sponsorId: 'user123',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Ad deleted" });
  });

  it('should return 404 if ad not found', async () => {
    SponsorAd.findOneAndDelete.mockResolvedValue(null);

    await deleteSponsorAd(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Ad not found or unauthorized" });
  });

  it('should return 500 on database error', async () => {
    SponsorAd.findOneAndDelete.mockRejectedValue(new Error('Delete failed'));

    await deleteSponsorAd(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Delete failed' });
  });
});