import { jest } from '@jest/globals';
import { GetSponsorByID } from '../../controllers/sponsor_controllers/sponsor.controller';
import User from "../../models/user.model.js";
import mongoose from "mongoose";

// Mock the User model methods
User.findOne = jest.fn();
User.find = jest.fn();
User.findById = jest.fn();

describe('GetSponsorByID', () => {
  let req, res;

  beforeEach(() => {
    req = { params: { sponsorId: 'validId' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 400 if sponsorId is invalid', async () => {
    req.params.sponsorId = 'invalid-id';
    // We don't need to mock mongoose.isValid here if we pass a string that is genuinely invalid,
    // but to be safe/explicit:
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);

    await GetSponsorByID(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid sponsor ID format" });
  });

  it('should return 404 if sponsor is not found', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    
    // Mock chain: User.findOne().select() -> null
    const mockSelect = jest.fn().mockResolvedValue(null);
    User.findOne.mockReturnValue({ select: mockSelect });

    await GetSponsorByID(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ _id: 'validId', role: "sponsor" });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Sponsor not found" });
  });

  it('should return 200 and sponsor data if found', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    const mockSponsor = { name: 'Test Sponsor' };
    
    const mockSelect = jest.fn().mockResolvedValue(mockSponsor);
    User.findOne.mockReturnValue({ select: mockSelect });

    await GetSponsorByID(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSponsor);
  });

  it('should return 500 on server error', async () => {
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    User.findOne.mockImplementation(() => { throw new Error("DB Fail"); });

    await GetSponsorByID(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch sponsor details" });
    consoleSpy.mockRestore();
  });
});