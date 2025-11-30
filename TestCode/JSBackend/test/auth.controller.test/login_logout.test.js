import { jest } from '@jest/globals';
import { login, logout } from '../../controllers/auth.controller.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// --- MOCKS ---
jest.mock('../../config/nodemailer.js', () => ({ sendMail: jest.fn() }));
jest.mock('../../models/user.model.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

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

// Ensure jwt methods are proper jest mocks
jwt.sign = jest.fn(() => 'mocked_token');
jwt.verify = jest.fn();

describe('Auth Controller - Login & Logout', () => {
  let req, res;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // --- LOGIN ---
  it('should return 400 if missing fields', async () => {
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email, password, and role are required' });
  });

  it('should return 401 if user does not exist', async () => {
    req.body = { email: 'e', password: 'p', role: 'r' };
    User.findOne = jest.fn().mockResolvedValue(null);
    await login(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'e', role: 'r' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
  });

  it('should return 401 if password does not match', async () => {
    req.body = { email: 'e', password: 'p', role: 'r' };
    User.findOne = jest.fn().mockResolvedValue({ passwordHash: 'hash' });
    bcrypt.compare = jest.fn().mockResolvedValue(false);
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
  });

  it('should login successfully', async () => {
    req.body = { email: 'e', password: 'p', role: 'r' };
    const mockUser = {
      _id: 'uid',
      email: 'e',
      role: 'r',
      passwordHash: 'hash',
      toObject: jest.fn().mockReturnValue({ _id: 'uid', email: 'e', role: 'r' }),
    };
    User.findOne = jest.fn().mockResolvedValue(mockUser);
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    await login(req, res);
    
    // Verify exact database query parameters
    expect(User.findOne).toHaveBeenCalledWith({ email: 'e', role: 'r' });
    
    // cookie options should include security-related flags
    expect(res.cookie).toHaveBeenCalledWith('token', 'mocked_token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // Exact 7 days in milliseconds
    }));
    // secure flag depends on NODE_ENV === 'production'
    const cookieOptions = res.cookie.mock.calls[0][2];
    expect(cookieOptions.secure).toBe(process.env.NODE_ENV === 'production');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'Login successful',
      token: 'mocked_token',
      user: expect.objectContaining({ id: 'uid', email: 'e', role: 'r' }),
    }));
  });

  it('should fail with only email missing', async () => {
    req.body = { password: 'p', role: 'r' };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email, password, and role are required' });
  });

  it('should fail with only password missing', async () => {
    req.body = { email: 'e', role: 'r' };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email, password, and role are required' });
  });

  it('should fail with only role missing', async () => {
    req.body = { email: 'e', password: 'p' };
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email, password, and role are required' });
  });

  it('should handle login errors', async () => {
    req.body = { email: 'e', password: 'p', role: 'r' };
    User.findOne = jest.fn().mockRejectedValue(new Error('Err'));
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Err' });
  });

  // --- LOGOUT ---
  it('should logout successfully', async () => {
    await logout(req, res);
    expect(res.clearCookie).toHaveBeenCalledWith('token', expect.objectContaining({
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    }));
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'logout succsefully' });
  });

  it('should handle logout errors', async () => {
    res.clearCookie.mockImplementation(() => { throw new Error('Err'); });
    await logout(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Err' });
  });
});