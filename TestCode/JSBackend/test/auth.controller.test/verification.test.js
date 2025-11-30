import { jest } from '@jest/globals';

import { generateOtpForAcc, verifyOtpForAcc } from '../../controllers/auth.controller.js';
import User from '../../models/user.model.js';
import transporter from '../../config/nodemailer.js';

// --- MOCKS ---
jest.mock('../../config/nodemailer.js', () => ({ sendMail: jest.fn() }));
jest.mock('../../models/user.model.js');

// Ensure User methods are proper jest mocks
User.findOne = jest.fn();
User.findById = jest.fn();
User.find = jest.fn();
User.create = jest.fn();
User.updateOne = jest.fn();
User.deleteOne = jest.fn();

// Ensure transporter.sendMail is a proper jest mock
transporter.sendMail = jest.fn();

describe('Auth Controller - Account Verification', () => {
  let req, res, mockUser;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = { user: { id: 'uid' }, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockUser = { _id: 'uid', email: 'e', save: jest.fn() };
    jest.clearAllMocks();
  });

  // --- GENERATE OTP ---
  it('should return 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);
    await generateOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User does not exist" });
  });

  it('should return 400 if account already verified', async () => {
    mockUser.isVerified = true;
    User.findById.mockResolvedValue(mockUser);
    await generateOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Account is already verified" });
  });

  it('should return 400 if OTP already sent', async () => {
    mockUser.verificationToken = '1';
    mockUser.verificationTokenExpires = new Date(Date.now() + 10000);
    User.findById.mockResolvedValue(mockUser);
    await generateOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "An OTP has already been sent. Please check your email." });
  });

  it('should send verification OTP successfully', async () => {
    User.findById.mockResolvedValue(mockUser);
    await generateOtpForAcc(req, res);
    
    // FIXED: Check for 6-digit pattern instead of hardcoded string
    expect(mockUser.verificationToken).toMatch(/^\d{6}$/);
    expect(mockUser.verificationTokenExpires).toBeDefined();
    
    expect(transporter.sendMail).toHaveBeenCalled();
    const mailCall = transporter.sendMail.mock.calls[0][0];
    expect(mailCall.from).toContain('Campus Event Manager');
    expect(mailCall.to).toBe('e');
    expect(mailCall.subject).toBe('Verify Your Account - Campus Event Manager');
    expect(mailCall.html).toContain(mockUser.verificationToken);
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Email sent successfully" });
  });

  it('should handle errors in generate', async () => {
    User.findById.mockRejectedValue(new Error('Err'));
    await generateOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Err' });
  });

  // --- VERIFY OTP ---
  it('should return 404 if user not found', async () => {
    req.body.otp = '1';
    User.findById.mockResolvedValue(null);
    await verifyOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User does not exist" });
  });

  it('should return 400 if already verified', async () => {
    req.body.otp = '1';
    mockUser.isVerified = true;
    User.findById.mockResolvedValue(mockUser);
    await verifyOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Account is already verified" });
  });

  it('should return 400 if token expired/missing', async () => {
    req.body.otp = '1';
    mockUser.verificationToken = '1';
    mockUser.verificationTokenExpires = new Date(Date.now() - 1000);
    User.findById.mockResolvedValue(mockUser);
    await verifyOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "OTP has expired. Please generate a new one." });
    expect(mockUser.verificationToken).toBeUndefined();
    expect(mockUser.verificationTokenExpires).toBeUndefined();
  });

  it('should return 400 if OTP incorrect', async () => {
    req.body.otp = 'WRONG';
    mockUser.verificationToken = 'RIGHT';
    mockUser.verificationTokenExpires = new Date(Date.now() + 10000);
    User.findById.mockResolvedValue(mockUser);
    await verifyOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "OTP is invalid." });
  });

  it('should verify account successfully', async () => {
    req.body.otp = 'RIGHT';
    mockUser.verificationToken = 'RIGHT';
    mockUser.verificationTokenExpires = new Date(Date.now() + 10000);
    User.findById.mockResolvedValue(mockUser);
    await verifyOtpForAcc(req, res);
    expect(mockUser.isVerified).toBe(true);
    expect(mockUser.verificationToken).toBeUndefined();
    expect(mockUser.verificationTokenExpires).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Account verified successfully." });
  });

  it('should handle errors in verify', async () => {
    req.body.otp = '1';
    User.findById.mockRejectedValue(new Error('Err'));
    await verifyOtpForAcc(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Err' });
  });
});