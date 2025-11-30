import { jest } from '@jest/globals';
import { GetAllSponsorNameDescpNoOfEsponsred } from '../../controllers/sponsor_controllers/sponsor.controller';
import User from "../../models/user.model.js";

// Mock the User model methods
User.find = jest.fn();
User.findById = jest.fn();

describe('GetAllSponsorNameDescpNoOfEsponsred', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 200 and a list of sponsors on success', async () => {
    const mockSponsors = [{ name: 'Sponsor 1' }, { name: 'Sponsor 2' }];
    
    // Mocking the chain: User.find().select()
    const mockSelect = jest.fn().mockResolvedValue(mockSponsors);
    User.find.mockReturnValue({ select: mockSelect });

    await GetAllSponsorNameDescpNoOfEsponsred(req, res);

    expect(User.find).toHaveBeenCalledWith({ role: "sponsor" });
    expect(mockSelect).toHaveBeenCalledWith("-passwordHash -verificationToken -passwordResetToken");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockSponsors);
  });

  it('should return 500 if database fails', async () => {
    const mockError = new Error('DB Error');
    
    // Spy on console.error to suppress error output during test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    User.find.mockImplementation(() => {
      throw mockError;
    });

    await GetAllSponsorNameDescpNoOfEsponsred(req, res);

    expect(consoleSpy).toHaveBeenCalledWith("Error fetching sponsor list:", mockError);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to fetch sponsor list" });
    
    consoleSpy.mockRestore();
  });
});