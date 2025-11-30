import { jest } from '@jest/globals';
import { requestForgotPassword, verifyForgotPassword } from '../../controllers/auth.controller.js';
import User from '../../models/user.model.js';
import transporter from '../../config/nodemailer.js';
import bcrypt from 'bcrypt';

// --- MOCKS ---
jest.mock('../../config/nodemailer.js', () => ({ sendMail: jest.fn() }));
jest.mock('../../models/user.model.js');
jest.mock('bcrypt');
// jest.mock('crypto', () => ({ randomInt: jest.fn(() => 555555) }));

// Ensure User methods are proper jest mocks
User.findOne = jest.fn();
User.findById = jest.fn();
User.find = jest.fn();
User.create = jest.fn();
User.updateOne = jest.fn();
User.deleteOne = jest.fn();

// Ensure transporter.sendMail is a proper jest mock
transporter.sendMail = jest.fn();

// Ensure bcrypt methods are proper jest mocks
bcrypt.hash = jest.fn();
bcrypt.compare = jest.fn();

describe('Auth Controller - Forgot Password (Public)', () => {
  let req, res, mockUser;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    mockUser = { email: 'e', role: 'r', save: jest.fn() };
    jest.clearAllMocks();
  });

  // --- REQUEST ---
  it('should return 400 if email/role missing', async () => {
    await requestForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email and role are required." });
  });

  it('should fail with only email missing', async () => {
    req.body = { role: 'r' };
    await requestForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should fail with only role missing', async () => {
    req.body = { email: 'e' };
    await requestForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 200 (privacy) if user not found', async () => {
    req.body = { email: 'e', role: 'r' };
    User.findOne.mockResolvedValue(null);
    await requestForgotPassword(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'e', role: 'r' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "If an account with that email and role exists, a reset link has been sent." });
  });

  it('should return 400 if OTP already sent', async () => {
    req.body = { email: 'e', role: 'r' };
    mockUser.passwordForgotToken = '1';
    mockUser.passwordForgotTokenExpires = new Date(Date.now() + 10000);
    User.findOne.mockResolvedValue(mockUser);
    await requestForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "An OTP has already been sent. Please check your email." });
  });

  it('should send OTP successfully', async () => {
    req.body = { email: 'e', role: 'r' };
    User.findOne.mockResolvedValue(mockUser);
    await requestForgotPassword(req, res);
    expect(mockUser.passwordForgotToken).toMatch(/^\d{6}$/);
    expect(mockUser.passwordForgotTokenExpires).toBeDefined();
    
    expect(transporter.sendMail).toHaveBeenCalled();
    const mailCall = transporter.sendMail.mock.calls[0][0];
    expect(mailCall.from).toContain('Campus Event Manager');
    expect(mailCall.to).toBe('e');
    expect(mailCall.subject).toContain('Password Reset');
    expect(mailCall.subject).toContain('r');
    expect(mailCall.html).toContain(mockUser.passwordForgotToken);
    expect(mailCall.html).toContain('10 minutes');
    
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "If an account with that email and role exists, a reset link has been sent." });
  });

  it('should handle errors in request', async () => {
    req.body = { email: 'e', role: 'r' };
    User.findOne.mockRejectedValue(new Error('Err'));
    await requestForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server error", error: 'Err' });
  });

  // --- VERIFY ---
  it('should return 400 if params missing', async () => {
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Email, role, OTP, and new password are required." });
  });

  it('should fail with only email missing in verify', async () => {
    req.body = { role: 'r', otp: '1', newPassword: 'p' };
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should fail with only role missing in verify', async () => {
    req.body = { email: 'e', otp: '1', newPassword: 'p' };
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should fail with only otp missing in verify', async () => {
    req.body = { email: 'e', role: 'r', newPassword: 'p' };
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should fail with only newPassword missing in verify', async () => {
    req.body = { email: 'e', role: 'r', otp: '1' };
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if user not found', async () => {
    req.body = { email: 'e', role: 'r', otp: '1', newPassword: 'p' };
    User.findOne.mockResolvedValue(null);
    await verifyForgotPassword(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'e', role: 'r' });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid OTP, email, or role." });
  });

  it('should return 400 if token expired', async () => {
    req.body = { email: 'e', role: 'r', otp: '1', newPassword: 'p' };
    mockUser.passwordForgotToken = '1';
    mockUser.passwordForgotTokenExpires = new Date(Date.now() - 1000);
    User.findOne.mockResolvedValue(mockUser);
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "OTP is invalid or has expired. Please request another." });
    expect(mockUser.passwordForgotToken).toBeUndefined();
    expect(mockUser.passwordForgotTokenExpires).toBeUndefined();
  });

  it('should return 400 if OTP mismatch', async () => {
    req.body = { email: 'e', role: 'r', otp: 'WRONG', newPassword: 'p' };
    mockUser.passwordForgotToken = 'RIGHT';
    mockUser.passwordForgotTokenExpires = new Date(Date.now() + 10000);
    User.findOne.mockResolvedValue(mockUser);
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid OTP." });
  });

  it('should reset password successfully', async () => {
    req.body = { email: 'e', role: 'r', otp: 'RIGHT', newPassword: 'p' };
    mockUser.passwordForgotToken = 'RIGHT';
    mockUser.passwordForgotTokenExpires = new Date(Date.now() + 10000);
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.hash.mockResolvedValue('newHash');
    
    await verifyForgotPassword(req, res);
    expect(mockUser.passwordHash).toBe('newHash');
    expect(mockUser.passwordForgotToken).toBeUndefined();
    expect(mockUser.passwordForgotTokenExpires).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "Password reset successfully. You can now log in." });
  });

  it('should handle errors in verify', async () => {
    req.body = { email: 'e', role: 'r', otp: '1', newPassword: 'p' };
    User.findOne.mockRejectedValue(new Error('Err'));
    await verifyForgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Server error", error: 'Err' });
  });
});