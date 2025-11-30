import { jest } from '@jest/globals';
import {
  GetAllSponsorNameDescpNoOfEsponsred,
  GetAllAdsBySpID
} from "../../controllers/sponsor_controllers/sponser-featch.controller.js";

import SponsorAd from "../../models/sponsorad.model.js";

// Mock model functions
SponsorAd.aggregate = jest.fn();
SponsorAd.find = jest.fn();

describe('Sponsor Ad Controllers', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { role: 'student' }, // Default mock user
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. GetAllSponsorNameDescpNoOfEsponsred
  // ==========================================================================
  describe('GetAllSponsorNameDescpNoOfEsponsred', () => {
    const mockAggregatedData = [
      {
        sponsorId: "sponsor123",
        name: "Tech Corp",
        description: "Leading Tech",
        noOfSponsored: 5
      },
      {
        sponsorId: "sponsor456",
        name: "Bev Co",
        description: "Best Drinks",
        noOfSponsored: 2
      }
    ];

    it('should return a list of sponsors with count successfully (200)', async () => {
      // Mock the aggregation result
      SponsorAd.aggregate.mockResolvedValue(mockAggregatedData);

      await GetAllSponsorNameDescpNoOfEsponsred(req, res);

      // Verify the exact aggregation pipeline structure
      expect(SponsorAd.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: "$sponsorId",
            noOfSponsored: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "sponsorDetails",
          },
        },
        {
          $unwind: "$sponsorDetails",
        },
        {
          $project: {
            _id: 0,
            sponsorId: "$_id",
            name: "$sponsorDetails.name",
            description: "$sponsorDetails.description",
            noOfSponsored: 1,
          },
        },
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAggregatedData,
      });
    });

    it('should return an empty list if no sponsors exist (200)', async () => {
      SponsorAd.aggregate.mockResolvedValue([]);

      await GetAllSponsorNameDescpNoOfEsponsred(req, res);

      // Verify the aggregation pipeline is called with correct structure
      expect(SponsorAd.aggregate).toHaveBeenCalledWith([
        {
          $group: {
            _id: "$sponsorId",
            noOfSponsored: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "sponsorDetails",
          },
        },
        {
          $unwind: "$sponsorDetails",
        },
        {
          $project: {
            _id: 0,
            sponsorId: "$_id",
            name: "$sponsorDetails.name",
            description: "$sponsorDetails.description",
            noOfSponsored: 1,
          },
        },
      ]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should return 500 if aggregation fails', async () => {
      const dbError = new Error("Database connection failed");
      SponsorAd.aggregate.mockRejectedValue(dbError);

      // Mock console.error to verify it's called with correct message
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await GetAllSponsorNameDescpNoOfEsponsred(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Error fetching sponsor list:", dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch sponsor list",
      });

      consoleSpy.mockRestore();
    });
  });

  // ==========================================================================
  // 2. GetAllAdsBySpID
  // ==========================================================================
  describe('GetAllAdsBySpID', () => {
    const mockSponsorId = "sponsor123";
    const mockAds = [
      { _id: "ad1", title: "Ad One", sponsorId: mockSponsorId },
      { _id: "ad2", title: "Ad Two", sponsorId: mockSponsorId }
    ];

    beforeEach(() => {
      req.params.sponsorId = mockSponsorId;
    });

    it('should return ads for a specific sponsor (200)', async () => {
      SponsorAd.find.mockResolvedValue(mockAds);

      await GetAllAdsBySpID(req, res);

      expect(SponsorAd.find).toHaveBeenCalledWith({ sponsorId: mockSponsorId });
      expect(SponsorAd.find).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockAds,
      });
      // Verify count matches array length
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.count).toBe(mockAds.length);
    });

    it('should return 404 if no ads are found (Empty Array)', async () => {
      SponsorAd.find.mockResolvedValue([]);

      await GetAllAdsBySpID(req, res);

      expect(SponsorAd.find).toHaveBeenCalledWith({ sponsorId: mockSponsorId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No ads found for this sponsor",
      });
      // Verify the exact response structure
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.success).toBe(false);
      expect(callArgs.message).toBe("No ads found for this sponsor");
    });

    it('should return 404 if result is null (Edge Case)', async () => {
      SponsorAd.find.mockResolvedValue(null);

      await GetAllAdsBySpID(req, res);

      expect(SponsorAd.find).toHaveBeenCalledWith({ sponsorId: mockSponsorId });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "No ads found for this sponsor",
      });
      // Verify the exact response structure
      const callArgs = res.json.mock.calls[0][0];
      expect(callArgs.success).toBe(false);
      expect(callArgs.message).toBe("No ads found for this sponsor");
    });

    it('should return 500 if database find fails', async () => {
      const dbError = new Error("DB Error");
      SponsorAd.find.mockRejectedValue(dbError);
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await GetAllAdsBySpID(req, res);

      expect(consoleSpy).toHaveBeenCalledWith("Error fetching sponsor ads:", dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch sponsor ads",
      });

      consoleSpy.mockRestore();
    });
  });
});