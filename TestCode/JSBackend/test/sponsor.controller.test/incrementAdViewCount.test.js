import { jest } from '@jest/globals';
import { incrementAdViewCount } from '../../controllers/sponsor_controllers/sponsor.controller';
import SponsorAd from "../../models/sponsorad.model.js";
import mongoose from "mongoose";

// Mock the SponsorAd model methods
SponsorAd.findByIdAndUpdate = jest.fn();
SponsorAd.find = jest.fn();
SponsorAd.findById = jest.fn();

describe('incrementAdViewCount', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { adId: 'validId' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 400 on invalid ID', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
    await incrementAdViewCount(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid ad ID" });
  });

  it('should call findByIdAndUpdate and sendStatus 200', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    
    const mockExec = jest.fn();
    // The controller calls .exec() but does NOT await it.
    SponsorAd.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

    await incrementAdViewCount(req, res);

    expect(SponsorAd.findByIdAndUpdate).toHaveBeenCalledWith('validId', { $inc: { views: 1 } });
    expect(mockExec).toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it('should catch errors and still return 200 (fire and forget)', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Make the DB call throw immediately
    SponsorAd.findByIdAndUpdate.mockImplementation(() => {
      throw new Error("Async Error");
    });

    await incrementAdViewCount(req, res);

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(200); // Ensures user isn't blocked
    
    consoleSpy.mockRestore();
  });
});