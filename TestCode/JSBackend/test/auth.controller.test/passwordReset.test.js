import { jest } from '@jest/globals';
import { requestPasswordReset, verifyOtpAndResetPassword } from '../../controllers/auth.controller.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import transporter from '../../config/nodemailer.js';

// --- MOCKS ---
jest.mock('../../config/nodemailer.js', () => ({ sendMail: jest.fn() })); // Prevent hang
jest.mock('../../models/user.model.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken', () => ({ sign: jest.fn(() => 'mocked_token') }));

// Ensure User methods are proper jest mocks
User.findOne = jest.fn();
User.findById = jest.fn();
User.find = jest.fn();
User.create = jest.fn();
User.updateOne = jest.fn();
User.deleteOne = jest.fn();

// Ensure bcrypt methods are proper jest mocks
bcrypt.hash = jest.fn();
bcrypt.compare = jest.fn();

// Ensure transporter.sendMail is a proper jest mock
transporter.sendMail = jest.fn();

describe('Auth Controller - Password Reset (Authenticated/Manual)', () => {
  let req, res, mockUser;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = { body: {}, user: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockUser = { _id: 'uid', email: 'e', profile: { name: 'n' }, save: jest.fn() };
    jest.clearAllMocks();
  });
  
  it('should fail if not authenticated and missing email/role', async () => {
    req.user = undefined; // No token
    await requestPasswordReset(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email and role are required" });
  });

  it('should use req.user.id if present', async () => {
    req.user = { id: 'uid' };
    User.findById.mockResolvedValue(mockUser);
    await requestPasswordReset(req, res);
    
    // FIX APPLIED HERE:
    expect(mockUser.passwordResetToken).toMatch(/^\d{6}$/); 
    expect(mockUser.passwordResetTokenExpires).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "OTP sent to your email successfully" });
  });

  it('should return 404 if authenticated user ID not found in DB', async () => {
    req.user = { id: 'uid' };
    User.findById.mockResolvedValue(null);
    await requestPasswordReset(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User not found" });
  });

  it('should return 200 (privacy) if unauthenticated email not found', async () => {
    req.user = undefined;
    req.body = { email: 'e', role: 'r' };
    User.findOne.mockResolvedValue(null);
    await requestPasswordReset(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "If an account with that email and role exists, an OTP has been sent." });
  });

  it('should return 400 if user object has no email', async () => {
    req.user = { id: 'uid' };
    mockUser.email = null;
    User.findById.mockResolvedValue(mockUser);
    await requestPasswordReset(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User email does not exist" });
  });

  it('should return 400 if OTP already sent/active', async () => {
    req.user = { id: 'uid' };
    mockUser.passwordResetToken = '123';
    mockUser.passwordResetTokenExpires = new Date(Date.now() + 10000);
    User.findById.mockResolvedValue(mockUser);
    await requestPasswordReset(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "An OTP has already been sent. Please check your email." });
  });

  it('should catch errors', async () => {
    req.user = { id: 'uid' };
    User.findById.mockRejectedValue(new Error('Err'));
    await requestPasswordReset(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server error", error: 'Err' });
  });

  // --- VERIFY ---
  it('should return 400 if OTP/Password missing', async () => {
    await verifyOtpAndResetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "OTP and new password are required" });
  });

  it('should find user by ID (Auth)', async () => {
    req.user = { id: 'uid' };
    req.body = { otp: '1', newPassword: 'p' };
    User.findById.mockResolvedValue(null);
    await verifyOtpAndResetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User not found" });
  });

  it('should find user by Email/Role (No Auth)', async () => {
    req.user = undefined;
    req.body = { otp: '1', newPassword: 'p', email: 'e', role: 'r' };
    User.findOne.mockResolvedValue(null);
    await verifyOtpAndResetPassword(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'e', role: 'r' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "User not found" });
  });

  it('should return 400 if missing email/role in No Auth mode', async () => {
    req.user = undefined;
    req.body = { otp: '1', newPassword: 'p' }; // Missing email/role
    await verifyOtpAndResetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email and role are required" });
  });

  it('should return 400 if OTP expired', async () => {
    req.user = { id: 'uid' };
    req.body = { otp: '1', newPassword: 'p' };
    mockUser.passwordResetToken = '1';
    mockUser.passwordResetTokenExpires = new Date(Date.now() - 1000);
    User.findById.mockResolvedValue(mockUser);
    await verifyOtpAndResetPassword(req, res);
    expect(User.findById).toHaveBeenCalledWith('uid');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "OTP is invalid or has expired. Please request another." });
    expect(mockUser.passwordResetToken).toBeUndefined();
    expect(mockUser.passwordResetTokenExpires).toBeUndefined();
  });

  it('should reject OTP expired by 1 second', async () => {
    req.user = { id: 'uid' };
    req.body = { otp: '1', newPassword: 'p' };
    mockUser.passwordResetToken = '1';
    mockUser.passwordResetTokenExpires = new Date(Date.now() - 1);
    User.findById.mockResolvedValue(mockUser);
    await verifyOtpAndResetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should accept OTP valid by 1 second', async () => {
    req.user = { id: 'uid' };
    req.body = { otp: '123', newPassword: 'p' };
    mockUser.passwordResetToken = '123';
    mockUser.passwordResetTokenExpires = new Date(Date.now() + 1);
    User.findById.mockResolvedValue(mockUser);
    bcrypt.hash.mockResolvedValue('newhash');
    await verifyOtpAndResetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should return 400 if OTP invalid', async () => {
    req.user = { id: 'uid' };
    req.body = { otp: 'WRONG', newPassword: 'p' };
    mockUser.passwordResetToken = 'RIGHT';
    mockUser.passwordResetTokenExpires = new Date(Date.now() + 10000);
    User.findById.mockResolvedValue(mockUser);
    await verifyOtpAndResetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid OTP" });
  });

  it('should reset password successfully', async () => {
    req.user = { id: 'uid' };
    req.body = { otp: '123456', newPassword: 'p' };
    mockUser.passwordResetToken = '123456';
    mockUser.passwordResetTokenExpires = new Date(Date.now() + 10000);
    User.findById.mockResolvedValue(mockUser);
    bcrypt.hash.mockResolvedValue('newhash');

    await verifyOtpAndResetPassword(req, res);
    expect(mockUser.passwordHash).toBe('newhash');
    expect(mockUser.passwordResetToken).toBeUndefined();
    expect(mockUser.passwordResetTokenExpires).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Password reset successfully" });
  });

  it('should handle errors in verify', async () => {
    req.body = { otp: '1', newPassword: 'p', email: 'e', role: 'r' };
    User.findOne.mockRejectedValue(new Error('Err'));
    await verifyOtpAndResetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server error", error: 'Err' });
  });
});