import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getEventPerformance } from '../../controllers/organizer_controllers/analytics.controller.js';

describe('Analytics Controller - getEventPerformance', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    jest.clearAllMocks();
  });

  // Test: Returns mocked event performance data
  it('should return mocked event performance data', async () => {
    await getEventPerformance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    
    const expectedData = [
      { name: 'Excellent', value: 45, color: '#2D3E7E' },
      { name: 'Good', value: 35, color: '#FDB913' },
      { name: 'Average', value: 15, color: '#FF9F1C' },
      { name: 'Poor', value: 5, color: '#F24333' },
    ];
    
    expect(res.json).toHaveBeenCalledWith(expectedData);
  });

  // Test: Data structure validation
  it('should return array with correct structure', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(4);
    
    data.forEach(item => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('color');
      expect(typeof item.name).toBe('string');
      expect(typeof item.value).toBe('number');
      expect(typeof item.color).toBe('string');
    });
  });

  // Test: Verify all performance categories
  it('should have data for all performance categories', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    const categories = data.map(item => item.name);
    
    expect(categories).toContain('Excellent');
    expect(categories).toContain('Good');
    expect(categories).toContain('Average');
    expect(categories).toContain('Poor');
  });

  // Test: Verify color codes
  it('should have valid hex color codes', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    const hexColorPattern = /^#[0-9A-F]{6}$/i;
    
    data.forEach(item => {
      expect(item.color).toMatch(hexColorPattern);
    });
  });

  // Test: Verify specific values
  it('should return correct value for Excellent category', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    const excellentData = data.find(item => item.name === 'Excellent');
    
    expect(excellentData.value).toBe(45);
    expect(excellentData.color).toBe('#2D3E7E');
  });

  // Test: Verify Good category
  it('should return correct value for Good category', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    const goodData = data.find(item => item.name === 'Good');
    
    expect(goodData.value).toBe(35);
    expect(goodData.color).toBe('#FDB913');
  });

  // Test: Verify Average category
  it('should return correct value for Average category', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    const averageData = data.find(item => item.name === 'Average');
    
    expect(averageData.value).toBe(15);
    expect(averageData.color).toBe('#FF9F1C');
  });

  // Test: Verify Poor category
  it('should return correct value for Poor category', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    const poorData = data.find(item => item.name === 'Poor');
    
    expect(poorData.value).toBe(5);
    expect(poorData.color).toBe('#F24333');
  });

  // Test: Verify all positive values
  it('should have all positive values', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    
    data.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
    });
  });

  // Test: Verify total percentage adds to 100
  it('should have values that add up to 100', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    expect(total).toBe(100);
  });

  // Test: Response status code
  it('should return status 200', async () => {
    await getEventPerformance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  // Test: Function doesn't use req object
  it('should work with empty req object', async () => {
    req = {};
    
    await getEventPerformance(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  // Test: Function doesn't throw errors
  it('should not throw any errors', async () => {
    await expect(getEventPerformance(req, res)).resolves.not.toThrow();
  });

  // Test: Return value consistency
  it('should return same data on multiple calls', async () => {
    await getEventPerformance(req, res);
    const firstCall = res.json.mock.calls[0][0];

    jest.clearAllMocks();

    await getEventPerformance(req, res);
    const secondCall = res.json.mock.calls[0][0];

    expect(firstCall).toEqual(secondCall);
  });

  // Test: Data ordering
  it('should return data in correct order', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    
    expect(data[0].name).toBe('Excellent');
    expect(data[1].name).toBe('Good');
    expect(data[2].name).toBe('Average');
    expect(data[3].name).toBe('Poor');
  });

  // Test: Verify no undefined or null values
  it('should not have undefined or null values', async () => {
    await getEventPerformance(req, res);

    const data = res.json.mock.calls[0][0];
    
    data.forEach(item => {
      expect(item.name).toBeDefined();
      expect(item.value).toBeDefined();
      expect(item.color).toBeDefined();
      expect(item.name).not.toBeNull();
      expect(item.value).not.toBeNull();
      expect(item.color).not.toBeNull();
    });
  });
});
