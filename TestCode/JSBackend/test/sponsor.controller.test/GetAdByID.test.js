import { jest } from '@jest/globals';
import { GetAdByID } from '../../controllers/sponsor_controllers/sponsor.controller.js';
import SponsorAd from "../../models/sponsorad.model.js";
import mongoose from "mongoose";

// Mock the SponsorAd model methods
SponsorAd.findById = jest.fn();
SponsorAd.find = jest.fn();

describe('GetAdByID', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { adId: 'validId' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 400 for invalid ad ID', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
    
    await GetAdByID(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid ad ID format" });
  });

  it('should return 404 if ad not found', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    
    // Mock chain: findById().populate() -> null
    const mockPopulate = jest.fn().mockResolvedValue(null);
    SponsorAd.findById.mockReturnValue({ populate: mockPopulate });

    await GetAdByID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Advertisement not found or is not published" });
  });

  it('should return 404 if ad is found but status is not Published', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    
    const mockAd = { status: 'Draft' };
    const mockPopulate = jest.fn().mockResolvedValue(mockAd);
    SponsorAd.findById.mockReturnValue({ populate: mockPopulate });

    await GetAdByID(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return 200 and the ad if found and published', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    
    const mockAd = { status: 'Published', title: 'Cool Ad' };
    const mockPopulate = jest.fn().mockResolvedValue(mockAd);
    SponsorAd.findById.mockReturnValue({ populate: mockPopulate });

    await GetAdByID(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAd);
    expect(SponsorAd.findById).toHaveBeenCalledWith('validId');
    expect(mockPopulate).toHaveBeenCalledWith({
      path: "sponsorId",
      select: "profile.name email sponsorDetails.firmLogo",
    });
  });

  it('should return 500 on error', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    SponsorAd.findById.mockImplementation(() => { throw new Error('DB Error'); });

    await GetAdByID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch ad details" });
  });
});