import { jest } from '@jest/globals';
import { toggleAdLike } from '../../controllers/sponsor_controllers/sponsor.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";
import mongoose from "mongoose";

// Mock the SponsorAd model methods
SponsorAd.findByIdAndUpdate = jest.fn();
SponsorAd.findById = jest.fn();
SponsorAd.find = jest.fn();
SponsorAd.prototype.save = jest.fn();

describe('toggleAdLike Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { 
      params: { adId: 'validId' },
      body: { liked: true }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 400 for invalid ID', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
    await toggleAdLike(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid ad ID" });
  });

  it('should increment likes if liked is true', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    req.body.liked = true;
    
    const mockResult = { likes: 10 };
    const mockSelect = jest.fn().mockResolvedValue(mockResult);
    
    // Chain: findByIdAndUpdate(..., ..., ...).select('likes')
    SponsorAd.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

    await toggleAdLike(req, res);

    expect(SponsorAd.findByIdAndUpdate).toHaveBeenCalledWith(
      'validId',
      { $inc: { likes: 1 } },
      { new: true }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ likes: 10 });
  });

  it('should decrement likes if liked is false', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    req.body.liked = false;
    
    const mockResult = { likes: 9 };
    const mockSelect = jest.fn().mockResolvedValue(mockResult);
    SponsorAd.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

    await toggleAdLike(req, res);

    expect(SponsorAd.findByIdAndUpdate).toHaveBeenCalledWith(
      'validId',
      { $inc: { likes: -1 } }, // Logic check: -1
      { new: true }
    );
    expect(res.json).toHaveBeenCalledWith({ likes: 9 });
  });

  it('should return 500 on DB error', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    
    SponsorAd.findByIdAndUpdate.mockImplementation(() => {
        throw new Error("Update fail");
    });

    await toggleAdLike(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to update like count" });
  });
});