import { jest } from '@jest/globals';
import { applyForCollegeRegistration, getAllApprovedColleges, getAllCollegesForAdmin } from '../../controllers/college.controller.js';
import College from '../../models/college.model.js';

// Mock the College model methods
College.findOne = jest.fn();
College.findById = jest.fn();
College.find = jest.fn();
College.create = jest.fn();
College.updateOne = jest.fn();
College.deleteOne = jest.fn();
College.prototype.save = jest.fn();

describe('College Controller', () => {
  let req, res;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    
    // Set default behavior for College.prototype.save
    College.prototype.save.mockResolvedValue(true);
  });

  describe('applyForCollegeRegistration', () => {
    it('should return 400 if name is missing', async () => {
      req.body = { code: 'C001', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
      expect(College.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 if code is missing', async () => {
      req.body = { name: 'College A', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
      expect(College.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 if poc is missing', async () => {
      req.body = { name: 'College A', code: 'C001', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
      expect(College.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 if address is missing', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
      expect(College.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 if all required fields are missing', async () => {
      req.body = {};

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
      expect(College.findOne).not.toHaveBeenCalled();
    });

    it('should return 400 if name is empty string', async () => {
      req.body = { name: '', code: 'C001', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 400 if code is empty string', async () => {
      req.body = { name: 'College A', code: '', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 400 if poc is empty string', async () => {
      req.body = { name: 'College A', code: 'C001', poc: '', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 400 if address is empty string', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 400 if name is null', async () => {
      req.body = { name: null, code: 'C001', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 400 if name is undefined', async () => {
      req.body = { name: undefined, code: 'C001', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 400 if name is 0', async () => {
      req.body = { name: 0, code: 'C001', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 400 if name is false', async () => {
      req.body = { name: false, code: 'C001', poc: 'John', address: '123 St' };

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing required fields for college registration.' });
    });

    it('should return 409 if college with same name exists', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '123 St' };
      College.findOne.mockResolvedValue({ name: 'College A', code: 'C002' });

      await applyForCollegeRegistration(req, res);

      expect(College.findOne).toHaveBeenCalledWith({ $or: [{ name: 'College A' }, { code: 'C001' }] });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'A college with this name or code already exists.' });
    });

    it('should return 409 if college with same code exists', async () => {
      req.body = { name: 'College B', code: 'C001', poc: 'John', address: '123 St' };
      College.findOne.mockResolvedValue({ name: 'College A', code: 'C001' });

      await applyForCollegeRegistration(req, res);

      expect(College.findOne).toHaveBeenCalledWith({ $or: [{ name: 'College B' }, { code: 'C001' }] });
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'A college with this name or code already exists.' });
    });

    it('should create college successfully with all fields', async () => {
      req.body = {
        name: 'College A',
        code: 'C001',
        website: 'https://college.edu',
        description: 'A great college',
        poc: 'John Doe',
        address: '123 Main St'
      };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      await applyForCollegeRegistration(req, res);

      expect(College.findOne).toHaveBeenCalledWith({ $or: [{ name: 'College A' }, { code: 'C001' }] });
      expect(College.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'College registration submitted successfully. It is pending approval from an admin.',
        college: expect.objectContaining({
          name: 'College A',
          code: 'C001',
          website: 'https://college.edu',
          description: 'A great college',
          status: 'Pending'
        })
      }));
    });

    it('should create college successfully with only required fields', async () => {
      req.body = {
        name: 'College B',
        code: 'C002',
        poc: 'Jane Smith',
        address: '456 Oak Ave'
      };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      await applyForCollegeRegistration(req, res);

      expect(College.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'College registration submitted successfully. It is pending approval from an admin.',
        college: expect.objectContaining({
          name: 'College B',
          code: 'C002',
          status: 'Pending'
        })
      }));
    });

    it('should handle database error during findOne', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '123 St' };
      const dbError = new Error('Database connection failed');
      College.findOne.mockRejectedValue(dbError);

      await applyForCollegeRegistration(req, res);

      expect(console.error).toHaveBeenCalledWith('Error registering college:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during college registration.',
        error: 'Database connection failed'
      });
    });

    it('should handle database error during save', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '123 St' };
      College.findOne.mockResolvedValue(null);
      const saveError = new Error('Save operation failed');
      College.prototype.save.mockRejectedValue(saveError);

      await applyForCollegeRegistration(req, res);

      expect(console.error).toHaveBeenCalledWith('Error registering college:', saveError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during college registration.',
        error: 'Save operation failed'
      });
    });

    it('should handle error without message property', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '123 St' };
      const error = { toString: () => 'Unknown error' };
      College.findOne.mockRejectedValue(error);

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during college registration.',
        error: undefined
      });
    });

    it('should handle synchronous error', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '123 St' };
      College.findOne.mockImplementation(() => {
        throw new Error('Sync error');
      });

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error during college registration.',
        error: 'Sync error'
      });
    });

    it('should handle website field with valid URL', async () => {
      req.body = {
        name: 'College C',
        code: 'C003',
        website: 'https://example.com',
        poc: 'Bob',
        address: '789 St'
      };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle description field', async () => {
      req.body = {
        name: 'College D',
        code: 'C004',
        description: 'Best college in the city',
        poc: 'Alice',
        address: '111 St'
      };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle long strings in fields', async () => {
      req.body = {
        name: 'A'.repeat(200),
        code: 'C'.repeat(50),
        poc: 'P'.repeat(100),
        address: 'X'.repeat(300)
      };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle special characters in fields', async () => {
      req.body = {
        name: 'São Paulo University',
        code: 'SPU-2024',
        poc: 'José María',
        address: '123 Ävenüe, Côte d\'Azur'
      };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      await applyForCollegeRegistration(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should verify return value on validation failure', async () => {
      req.body = {};
      res.json.mockReturnValue('validation_return');

      const result = await applyForCollegeRegistration(req, res);

      expect(result).toBe('validation_return');
    });

    it('should verify return value on conflict', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '123 St' };
      College.findOne.mockResolvedValue({ name: 'College A' });
      res.json.mockReturnValue('conflict_return');

      const result = await applyForCollegeRegistration(req, res);

      expect(result).toBe('conflict_return');
    });

    it('should verify return value on success', async () => {
      req.body = { name: 'College A', code: 'C001', poc: 'John', address: '123 St' };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      const result = await applyForCollegeRegistration(req, res);

      expect(result).toBeUndefined();
    });

    it('should handle whitespace in required fields as valid', async () => {
      req.body = {
        name: '  College E  ',
        code: '  C005  ',
        poc: '  John  ',
        address: '  123 St  '
      };
      College.findOne.mockResolvedValue(null);
      College.prototype.save.mockResolvedValue(true);

      await applyForCollegeRegistration(req, res);

      expect(College.findOne).toHaveBeenCalledWith({
        $or: [{ name: '  College E  ' }, { code: '  C005  ' }]
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getAllApprovedColleges', () => {
    it('should return all approved colleges', async () => {
      const mockColleges = [
        { _id: '1', name: 'College A', code: 'C001' },
        { _id: '2', name: 'College B', code: 'C002' }
      ];
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockColleges)
      };
      College.find.mockReturnValue(mockQuery);

      await getAllApprovedColleges(req, res);

      expect(College.find).toHaveBeenCalledWith({ status: 'Approved' });
      expect(mockQuery.select).toHaveBeenCalledWith('name code');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockColleges);
    });

    it('should return empty array when no approved colleges exist', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue([])
      };
      College.find.mockReturnValue(mockQuery);

      await getAllApprovedColleges(req, res);

      expect(College.find).toHaveBeenCalledWith({ status: 'Approved' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle database error during find', async () => {
      const dbError = new Error('Database query failed');
      College.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(dbError)
      });

      await getAllApprovedColleges(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching approved colleges:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching colleges.' });
    });

    it('should handle error during select', async () => {
      const selectError = new Error('Select operation failed');
      College.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(selectError)
      });

      await getAllApprovedColleges(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching approved colleges:', selectError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching colleges.' });
    });

    it('should handle synchronous error', async () => {
      College.find.mockImplementation(() => {
        throw new Error('Sync error');
      });

      await getAllApprovedColleges(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching colleges.' });
    });

    it('should return multiple approved colleges', async () => {
      const mockColleges = Array.from({ length: 10 }, (_, i) => ({
        _id: `id${i}`,
        name: `College ${i}`,
        code: `C00${i}`
      }));
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockColleges)
      };
      College.find.mockReturnValue(mockQuery);

      await getAllApprovedColleges(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockColleges);
    });

    it('should only select name and code fields', async () => {
      const mockColleges = [
        { name: 'College A', code: 'C001' }
      ];
      const mockQuery = {
        select: jest.fn().mockResolvedValue(mockColleges)
      };
      College.find.mockReturnValue(mockQuery);

      await getAllApprovedColleges(req, res);

      expect(mockQuery.select).toHaveBeenCalledWith('name code');
      expect(res.json).toHaveBeenCalledWith(mockColleges);
    });

    it('should verify return value on success', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue([])
      };
      College.find.mockReturnValue(mockQuery);

      const result = await getAllApprovedColleges(req, res);

      expect(result).toBeUndefined();
    });

    it('should verify return value on error', async () => {
      College.find.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('test'))
      });

      const result = await getAllApprovedColleges(req, res);

      expect(result).toBeUndefined();
    });
  });

  describe('getAllCollegesForAdmin', () => {
    it('should return all colleges sorted by createdAt descending', async () => {
      const mockColleges = [
        { _id: '1', name: 'College A', status: 'Pending', createdAt: new Date('2024-01-02') },
        { _id: '2', name: 'College B', status: 'Approved', createdAt: new Date('2024-01-01') }
      ];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockColleges)
      };
      College.find.mockReturnValue(mockQuery);

      await getAllCollegesForAdmin(req, res);

      expect(College.find).toHaveBeenCalledWith({});
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockColleges);
    });

    it('should return empty array when no colleges exist', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };
      College.find.mockReturnValue(mockQuery);

      await getAllCollegesForAdmin(req, res);

      expect(College.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return colleges with all statuses', async () => {
      const mockColleges = [
        { _id: '1', name: 'College A', status: 'Pending' },
        { _id: '2', name: 'College B', status: 'Approved' },
        { _id: '3', name: 'College C', status: 'Rejected' }
      ];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockColleges)
      };
      College.find.mockReturnValue(mockQuery);

      await getAllCollegesForAdmin(req, res);

      expect(College.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockColleges);
    });

    it('should handle database error during find', async () => {
      const dbError = new Error('Database query failed');
      College.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(dbError)
      });

      await getAllCollegesForAdmin(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching all colleges for admin:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching colleges for admin.' });
    });

    it('should handle error during sort', async () => {
      const sortError = new Error('Sort operation failed');
      College.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(sortError)
      });

      await getAllCollegesForAdmin(req, res);

      expect(console.error).toHaveBeenCalledWith('Error fetching all colleges for admin:', sortError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching colleges for admin.' });
    });

    it('should handle synchronous error', async () => {
      College.find.mockImplementation(() => {
        throw new Error('Sync error');
      });

      await getAllCollegesForAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error while fetching colleges for admin.' });
    });

    it('should return large number of colleges', async () => {
      const mockColleges = Array.from({ length: 100 }, (_, i) => ({
        _id: `id${i}`,
        name: `College ${i}`,
        status: i % 2 === 0 ? 'Approved' : 'Pending',
        createdAt: new Date()
      }));
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockColleges)
      };
      College.find.mockReturnValue(mockQuery);

      await getAllCollegesForAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockColleges);
    });

    it('should ensure sort parameter is correct', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };
      College.find.mockReturnValue(mockQuery);

      await getAllCollegesForAdmin(req, res);

      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should verify return value on success', async () => {
      const mockQuery = {
        sort: jest.fn().mockResolvedValue([])
      };
      College.find.mockReturnValue(mockQuery);

      const result = await getAllCollegesForAdmin(req, res);

      expect(result).toBeUndefined();
    });

    it('should verify return value on error', async () => {
      College.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('test'))
      });

      const result = await getAllCollegesForAdmin(req, res);

      expect(result).toBeUndefined();
    });

    it('should return all fields for colleges', async () => {
      const mockColleges = [
        {
          _id: '1',
          name: 'College A',
          code: 'C001',
          website: 'https://college-a.edu',
          description: 'Description A',
          poc: 'John Doe',
          address: '123 St',
          status: 'Pending',
          createdAt: new Date()
        }
      ];
      const mockQuery = {
        sort: jest.fn().mockResolvedValue(mockColleges)
      };
      College.find.mockReturnValue(mockQuery);

      await getAllCollegesForAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith(mockColleges);
    });
  });
});
