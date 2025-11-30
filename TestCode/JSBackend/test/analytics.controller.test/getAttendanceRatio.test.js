import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getAttendanceRatio } from '../../controllers/organizer_controllers/analytics.controller.js';

describe('Analytics Controller - getAttendanceRatio', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    jest.clearAllMocks();
  });

  // Test: Returns mocked attendance ratio data
  it('should return mocked attendance ratio data', async () => {
    await getAttendanceRatio(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    
    const expectedData = [
      { month: 'Jan', registered: 450, attended: 398 },
      { month: 'Feb', registered: 380, attended: 345 },
      { month: 'Mar', registered: 520, attended: 490 },
      { month: 'Apr', registered: 600, attended: 565 },
      { month: 'May', registered: 480, attended: 430 },
      { month: 'Jun', registered: 550, attended: 520 },
    ];
    
    expect(res.json).toHaveBeenCalledWith(expectedData);
  });

  // Test: Data structure validation
  it('should return array with correct structure', async () => {
    await getAttendanceRatio(req, res);

    const data = res.json.mock.calls[0][0];
    
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(6);
    
    data.forEach(item => {
      expect(item).toHaveProperty('month');
      expect(item).toHaveProperty('registered');
      expect(item).toHaveProperty('attended');
      expect(typeof item.month).toBe('string');
      expect(typeof item.registered).toBe('number');
      expect(typeof item.attended).toBe('number');
    });
  });

  // Test: Verify specific months
  it('should have data for all 6 months', async () => {
    await getAttendanceRatio(req, res);

    const data = res.json.mock.calls[0][0];
    const months = data.map(item => item.month);
    
    expect(months).toContain('Jan');
    expect(months).toContain('Feb');
    expect(months).toContain('Mar');
    expect(months).toContain('Apr');
    expect(months).toContain('May');
    expect(months).toContain('Jun');
  });

  // Test: Verify attendance is less than or equal to registered
  it('should have attended count less than or equal to registered', async () => {
    await getAttendanceRatio(req, res);

    const data = res.json.mock.calls[0][0];
    
    data.forEach(item => {
      expect(item.attended).toBeLessThanOrEqual(item.registered);
    });
  });

  // Test: Verify specific values
  it('should return correct values for January', async () => {
    await getAttendanceRatio(req, res);

    const data = res.json.mock.calls[0][0];
    const janData = data.find(item => item.month === 'Jan');
    
    expect(janData.registered).toBe(450);
    expect(janData.attended).toBe(398);
  });

  // Test: Verify all positive numbers
  it('should have all positive numbers', async () => {
    await getAttendanceRatio(req, res);

    const data = res.json.mock.calls[0][0];
    
    data.forEach(item => {
      expect(item.registered).toBeGreaterThan(0);
      expect(item.attended).toBeGreaterThan(0);
    });
  });

  // Test: Response status code
  it('should return status 200', async () => {
    await getAttendanceRatio(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Test: Function doesn't use req object
  it('should work with empty req object', async () => {
    req = {};
    
    await getAttendanceRatio(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  // Test: Function doesn't throw errors
  it('should not throw any errors', async () => {
    await expect(getAttendanceRatio(req, res)).resolves.not.toThrow();
  });

  // Test: Return value consistency
  it('should return same data on multiple calls', async () => {
    await getAttendanceRatio(req, res);
    const firstCall = res.json.mock.calls[0][0];

    jest.clearAllMocks();

    await getAttendanceRatio(req, res);
    const secondCall = res.json.mock.calls[0][0];

    expect(firstCall).toEqual(secondCall);
  });
});
