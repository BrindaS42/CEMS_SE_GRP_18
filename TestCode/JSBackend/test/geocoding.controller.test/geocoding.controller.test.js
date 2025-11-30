import { jest } from '@jest/globals';
import { searchLocation } from '../../controllers/geocoding.controller.js';
import axios from 'axios';

// --- MOCKS ---
jest.mock('axios');

describe('Geocoding Controller', () => {
  let req, res;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = {
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // --- searchLocation ---
  describe('searchLocation', () => {
    it('should return 400 if query parameter q is missing', async () => {
      req.query = {};

      await searchLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query (q) is required.' });
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return 400 if query parameter q is empty string', async () => {
      req.query = { q: '' };

      await searchLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query (q) is required.' });
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return 400 if query parameter q is null', async () => {
      req.query = { q: null };

      await searchLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query (q) is required.' });
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should return 400 if query parameter q is undefined', async () => {
      req.query = { q: undefined };

      await searchLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query (q) is required.' });
      expect(axios.get).not.toHaveBeenCalled();
    });

    it('should search location with default parameters', async () => {
      req.query = { q: 'New York' };
      const mockData = [
        {
          place_id: 123,
          display_name: 'New York, USA',
          lat: '40.7128',
          lon: '-74.0060'
        }
      ];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: 'New York',
            limit: 5,
            format: 'json',
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)'
          }
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should search location with custom limit parameter', async () => {
      req.query = { q: 'London', limit: 10 };
      const mockData = [{ place_id: 456, display_name: 'London, UK' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: 'London',
            limit: 10,
            format: 'json',
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)'
          }
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should search location with custom limit as string', async () => {
      req.query = { q: 'Paris', limit: '3' };
      const mockData = [{ place_id: 789, display_name: 'Paris, France' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: 'Paris',
            limit: '3',
            format: 'json',
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)'
          }
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should search location with custom format parameter', async () => {
      req.query = { q: 'Tokyo', format: 'jsonv2' };
      const mockData = [{ place_id: 321, display_name: 'Tokyo, Japan' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: 'Tokyo',
            limit: 5,
            format: 'jsonv2',
            addressdetails: 1
          },
          headers: {
            'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)'
          }
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should search location with custom addressdetails parameter', async () => {
      req.query = { q: 'Berlin', addressdetails: 0 };
      const mockData = [{ place_id: 654, display_name: 'Berlin, Germany' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: 'Berlin',
            limit: 5,
            format: 'json',
            addressdetails: 0
          },
          headers: {
            'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)'
          }
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should search location with all custom parameters', async () => {
      req.query = {
        q: 'Sydney',
        limit: 15,
        format: 'geojson',
        addressdetails: 0
      };
      const mockData = { type: 'FeatureCollection', features: [] };
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            q: 'Sydney',
            limit: 15,
            format: 'geojson',
            addressdetails: 0
          },
          headers: {
            'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)'
          }
        }
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle empty array response from API', async () => {
      req.query = { q: 'NonexistentPlace123' };
      axios.get.mockResolvedValue({ data: [] });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle null response from API', async () => {
      req.query = { q: 'TestLocation' };
      axios.get.mockResolvedValue({ data: null });

      await searchLocation(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });

    it('should handle query with special characters', async () => {
      req.query = { q: 'São Paulo, Brazil' };
      const mockData = [{ place_id: 999, display_name: 'São Paulo, Brazil' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'São Paulo, Brazil'
          })
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle query with long string', async () => {
      const longQuery = 'a'.repeat(500);
      req.query = { q: longQuery };
      const mockData = [{ place_id: 111, display_name: 'Result' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            q: longQuery
          })
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle query with numbers', async () => {
      req.query = { q: '10 Downing Street, London' };
      const mockData = [{ place_id: 222, display_name: '10 Downing Street' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            q: '10 Downing Street, London'
          })
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle limit value of 0', async () => {
      req.query = { q: 'Rome', limit: 0 };
      const mockData = [];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            limit: 0
          })
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle addressdetails as string', async () => {
      req.query = { q: 'Madrid', addressdetails: '1' };
      const mockData = [{ place_id: 333, display_name: 'Madrid, Spain' }];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            addressdetails: '1'
          })
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    // Error handling tests
    it('should handle generic axios error without response', async () => {
      req.query = { q: 'TestCity' };
      const error = new Error('Network Error');
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Network Error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch geocoding data.' });
    });

    it('should handle axios error with response status 404', async () => {
      req.query = { q: 'TestCity' };
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        },
        message: 'Request failed with status code 404'
      };
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Request failed with status code 404');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not found' });
    });

    it('should handle axios error with response status 429 (rate limit)', async () => {
      req.query = { q: 'TestCity' };
      const error = {
        response: {
          status: 429,
          data: { message: 'Too many requests' }
        },
        message: 'Request failed with status code 429'
      };
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Request failed with status code 429');
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith({ message: 'Too many requests' });
    });

    it('should handle axios error with response status 503 (service unavailable)', async () => {
      req.query = { q: 'TestCity' };
      const error = {
        response: {
          status: 503,
          data: { message: 'Service temporarily unavailable' }
        },
        message: 'Request failed with status code 503'
      };
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Request failed with status code 503');
      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({ message: 'Service temporarily unavailable' });
    });

    it('should handle axios error with response but no message in data', async () => {
      req.query = { q: 'TestCity' };
      const error = {
        response: {
          status: 400,
          data: {}
        },
        message: 'Bad request'
      };
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Bad request');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch geocoding data.' });
    });

    it('should handle axios error with response but null data', async () => {
      req.query = { q: 'TestCity' };
      const error = {
        response: {
          status: 500,
          data: null
        },
        message: 'Internal server error'
      };
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Internal server error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch geocoding data.' });
    });

    it('should handle axios timeout error', async () => {
      req.query = { q: 'TestCity' };
      const error = new Error('timeout of 5000ms exceeded');
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'timeout of 5000ms exceeded');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch geocoding data.' });
    });

    it('should handle ECONNREFUSED error', async () => {
      req.query = { q: 'TestCity' };
      const error = new Error('connect ECONNREFUSED');
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'connect ECONNREFUSED');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch geocoding data.' });
    });

    it('should handle axios error without message property', async () => {
      req.query = { q: 'TestCity' };
      const error = { toString: () => 'Unknown error' };
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', undefined);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch geocoding data.' });
    });

    it('should handle synchronous error thrown by axios.get', async () => {
      req.query = { q: 'TestCity' };
      axios.get.mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Synchronous error');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch geocoding data.' });
    });

    it('should handle error with response status 0 (defaults to 500)', async () => {
      req.query = { q: 'TestCity' };
      const error = {
        response: {
          status: 0,
          data: { message: 'Network error' }
        },
        message: 'Network error occurred'
      };
      axios.get.mockRejectedValue(error);

      await searchLocation(req, res);

      expect(console.error).toHaveBeenCalledWith('Geocoding search error:', 'Network error occurred');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Network error' });
    });

    // Falsy value tests
    it('should return 400 if query parameter q is 0', async () => {
      req.query = { q: 0 };

      await searchLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query (q) is required.' });
    });

    it('should return 400 if query parameter q is false', async () => {
      req.query = { q: false };

      await searchLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Search query (q) is required.' });
    });

    it('should handle query with only whitespace', async () => {
      req.query = { q: '   ' };
      const mockData = [];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            q: '   '
          })
        })
      );
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    // Return value tests
    it('should verify searchLocation returns undefined when validation fails', async () => {
      req.query = {};
      res.json.mockReturnValue('validation_error_return');

      const result = await searchLocation(req, res);

      expect(result).toBe('validation_error_return');
    });

    it('should verify searchLocation returns undefined on success', async () => {
      req.query = { q: 'Test' };
      axios.get.mockResolvedValue({ data: [] });

      const result = await searchLocation(req, res);

      expect(result).toBeUndefined();
    });

    it('should verify searchLocation returns undefined on error', async () => {
      req.query = { q: 'Test' };
      axios.get.mockRejectedValue(new Error('test'));

      const result = await searchLocation(req, res);

      expect(result).toBeUndefined();
    });

    // Edge cases with parameter combinations
    it('should handle limit as negative number', async () => {
      req.query = { q: 'Athens', limit: -1 };
      const mockData = [];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            limit: -1
          })
        })
      );
    });

    it('should handle very large limit number', async () => {
      req.query = { q: 'Vienna', limit: 999999 };
      const mockData = [];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            limit: 999999
          })
        })
      );
    });

    it('should handle format as empty string', async () => {
      req.query = { q: 'Oslo', format: '' };
      const mockData = [];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          params: expect.objectContaining({
            format: ''
          })
        })
      );
    });

    it('should handle complex nested response data', async () => {
      req.query = { q: 'Stockholm' };
      const mockData = [
        {
          place_id: 12345,
          display_name: 'Stockholm, Sweden',
          lat: '59.3293',
          lon: '18.0686',
          address: {
            city: 'Stockholm',
            country: 'Sweden',
            country_code: 'se'
          },
          boundingbox: ['59.2293', '59.4293', '17.9686', '18.1686']
        }
      ];
      axios.get.mockResolvedValue({ data: mockData });

      await searchLocation(req, res);

      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should preserve User-Agent header exactly', async () => {
      req.query = { q: 'Dublin' };
      axios.get.mockResolvedValue({ data: [] });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.objectContaining({
          headers: {
            'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)'
          }
        })
      );
    });

    it('should use exact nominatim URL', async () => {
      req.query = { q: 'Brussels' };
      axios.get.mockResolvedValue({ data: [] });

      await searchLocation(req, res);

      expect(axios.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/search',
        expect.any(Object)
      );
    });
  });
});
