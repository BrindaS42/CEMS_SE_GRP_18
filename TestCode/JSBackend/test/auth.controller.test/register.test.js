import { jest } from '@jest/globals';
import { register } from '../../controllers/auth.controller.js';
import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// --- MOCKS ---
jest.mock('../../config/nodemailer.js', () => ({ sendMail: jest.fn() })); // Prevent hang
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

describe('Auth Controller - Register', () => {
  let req, res;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should return 400 if required fields are missing', async () => {
    req.body = { username: 'test' }; // Missing email, password, role
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Username, email, password, and role are required' });
  });

  it('should fail with only username missing', async () => {
    req.body = { email: 'e', password: 'p', role: 'admin' };
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should fail with only email missing', async () => {
    req.body = { username: 'u', password: 'p', role: 'admin' };
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should fail with only password missing', async () => {
    req.body = { username: 'u', email: 'e', role: 'admin' };
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should fail with only role missing', async () => {
    req.body = { username: 'u', email: 'e', password: 'p' };
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return 400 if role is student/organizer but college is missing', async () => {
    req.body = { username: 'u', email: 'e', password: 'p', role: 'student' };
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'College is required for student and organizer roles' });
  });

  it('should allow organizer role without college field', async () => {
    req.body = { username: 'u', email: 'e', password: 'p', role: 'organizer' };
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'College is required for student and organizer roles' });
  });

  it('should return 400 if college ID is provided but invalid', async () => {
    req.body = { username: 'u', email: 'e', password: 'p', role: 'student', college: 'bad_id' };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(false);
    
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid college selection' });
  });

  it('should return 409 if user already exists', async () => {
    req.body = { username: 'u', email: 'e', password: 'p', role: 'admin' };
    User.findOne.mockResolvedValue({ _id: 'exists' });
    
    await register(req, res);
    expect(User.findOne).toHaveBeenCalledWith({ email: 'e', role: 'admin' });
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User with this email and role already exists' });
  });

  it('should register a user successfully', async () => {
    req.body = { username: 'u', email: 'e', password: 'p', role: 'student', college: 'valid_id' };
    jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed_pass');
    
    const mockUser = {
      _id: 'new_id',
      email: 'e',
      role: 'student',
      college: 'valid_id',
      toObject: jest.fn().mockReturnValue({ _id: 'new_id', email: 'e', role: 'student', college: 'valid_id', profile: { name: 'u' } }),
    };
    User.create.mockResolvedValue(mockUser);

    await register(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'e', role: 'student' });
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
      email: 'e',
      passwordHash: 'hashed_pass',
      role: 'student',
      college: 'valid_id',
      profile: { name: 'u' }
    }));
    expect(res.cookie).toHaveBeenCalledWith('token', 'mocked_token', expect.objectContaining({ maxAge: 604800000, httpOnly: true, secure: false }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: 'User registered successfully',
      token: 'mocked_token',
      user: expect.objectContaining({ id: 'new_id', email: 'e', role: 'student' }),
    }));
  });

  it('should handle database errors', async () => {
    req.body = { username: 'u', email: 'e', password: 'p', role: 'admin' };
    User.findOne.mockRejectedValue(new Error('DB Error'));
    
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'DB Error' });
  });
});