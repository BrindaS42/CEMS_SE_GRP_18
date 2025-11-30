import { jest } from '@jest/globals';
import { getRecommendations, queryChatBot, rebuildSearchIndex } from '../../controllers/ai.controller.js';
import { pythonClient } from '../../services/ai.service.js';

// --- MOCKS ---
jest.mock('../../services/ai.service.js');

describe('AI Controller', () => {
  let req, res;

  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterAll(() => console.error.mockRestore());

  beforeEach(() => {
    req = {
      user: { id: 'user123', role: 'student' },
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  // --- getRecommendations ---
  describe('getRecommendations', () => {
    it('should return recommendations successfully', async () => {
      const mockData = { recommendations: ['event1', 'event2', 'event3'] };
      pythonClient.get.mockResolvedValue({ data: mockData });

      await getRecommendations(req, res);

      expect(pythonClient.get).toHaveBeenCalledWith('/recommend/hybrid/user123');
      expect(res.json).toHaveBeenCalledWith(mockData);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle error when python service fails', async () => {
      const mockError = new Error('Service unavailable');
      pythonClient.get.mockRejectedValue(mockError);

      await getRecommendations(req, res);

      expect(pythonClient.get).toHaveBeenCalledWith('/recommend/hybrid/user123');
      expect(console.error).toHaveBeenCalledWith('Hybrid Recommendation Error:', mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Hybrid recommendation failed' });
    });

    it('should handle network timeout error', async () => {
      const timeoutError = new Error('timeout of 15000ms exceeded');
      pythonClient.get.mockRejectedValue(timeoutError);

      await getRecommendations(req, res);

      expect(console.error).toHaveBeenCalledWith('Hybrid Recommendation Error:', timeoutError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Hybrid recommendation failed' });
    });

    it('should handle empty response from python service', async () => {
      pythonClient.get.mockResolvedValue({ data: {} });

      await getRecommendations(req, res);

      expect(pythonClient.get).toHaveBeenCalledWith('/recommend/hybrid/user123');
      expect(res.json).toHaveBeenCalledWith({});
    });

    it('should handle different user IDs correctly', async () => {
      req.user.id = 'differentUser456';
      const mockData = { recommendations: [] };
      pythonClient.get.mockResolvedValue({ data: mockData });

      await getRecommendations(req, res);

      expect(pythonClient.get).toHaveBeenCalledWith('/recommend/hybrid/differentUser456');
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle null data response', async () => {
      pythonClient.get.mockResolvedValue({ data: null });

      await getRecommendations(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  // --- queryChatBot ---
  describe('queryChatBot', () => {
    it('should return 400 if query is missing', async () => {
      req.body = {};

      await queryChatBot(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query required' });
      expect(pythonClient.post).not.toHaveBeenCalled();
    });

    it('should return 400 if query is empty string', async () => {
      req.body = { query: '' };

      await queryChatBot(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query required' });
      expect(pythonClient.post).not.toHaveBeenCalled();
    });

    it('should return 400 if query is null', async () => {
      req.body = { query: null };

      await queryChatBot(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query required' });
      expect(pythonClient.post).not.toHaveBeenCalled();
    });

    it('should return 400 if query is undefined', async () => {
      req.body = { query: undefined };

      await queryChatBot(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query required' });
      expect(pythonClient.post).not.toHaveBeenCalled();
    });

    it('should query chatbot successfully with valid query', async () => {
      req.body = { query: 'What events are happening today?' };
      const mockResponse = { answer: 'There are 3 events today', confidence: 0.95 };
      pythonClient.post.mockResolvedValue({ data: mockResponse });

      await queryChatBot(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/bot/query', {
        question: 'What events are happening today?',
        user_role: 'student',
        user_id: 'user123'
      });
      expect(res.json).toHaveBeenCalledWith(mockResponse);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle chatbot query with organizer role', async () => {
      req.user.role = 'organizer';
      req.body = { query: 'Show analytics' };
      const mockResponse = { answer: 'Analytics data', data: {} };
      pythonClient.post.mockResolvedValue({ data: mockResponse });

      await queryChatBot(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/bot/query', {
        question: 'Show analytics',
        user_role: 'organizer',
        user_id: 'user123'
      });
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle chatbot query with sponsor role', async () => {
      req.user.role = 'sponsor';
      req.user.id = 'sponsor789';
      req.body = { query: 'My sponsorships' };
      const mockResponse = { answer: 'Your sponsorships', sponsorships: [] };
      pythonClient.post.mockResolvedValue({ data: mockResponse });

      await queryChatBot(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/bot/query', {
        question: 'My sponsorships',
        user_role: 'sponsor',
        user_id: 'sponsor789'
      });
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle error when chatbot service fails', async () => {
      req.body = { query: 'test query' };
      const mockError = new Error('Chatbot service error');
      pythonClient.post.mockRejectedValue(mockError);

      await queryChatBot(req, res);

      expect(console.error).toHaveBeenCalledWith('Chatbot Error:', mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Chatbot failed' });
    });

    it('should handle network error in chatbot', async () => {
      req.body = { query: 'network test' };
      const networkError = new Error('ECONNREFUSED');
      pythonClient.post.mockRejectedValue(networkError);

      await queryChatBot(req, res);

      expect(console.error).toHaveBeenCalledWith('Chatbot Error:', networkError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Chatbot failed' });
    });

    it('should handle long query string', async () => {
      const longQuery = 'a'.repeat(1000);
      req.body = { query: longQuery };
      const mockResponse = { answer: 'Response to long query' };
      pythonClient.post.mockResolvedValue({ data: mockResponse });

      await queryChatBot(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/bot/query', {
        question: longQuery,
        user_role: 'student',
        user_id: 'user123'
      });
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle special characters in query', async () => {
      req.body = { query: 'What is @#$%^&*()?' };
      const mockResponse = { answer: 'Special chars handled' };
      pythonClient.post.mockResolvedValue({ data: mockResponse });

      await queryChatBot(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/bot/query', {
        question: 'What is @#$%^&*()?',
        user_role: 'student',
        user_id: 'user123'
      });
      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });

    it('should handle empty response from chatbot', async () => {
      req.body = { query: 'test' };
      pythonClient.post.mockResolvedValue({ data: {} });

      await queryChatBot(req, res);

      expect(res.json).toHaveBeenCalledWith({});
    });

    it('should handle null response from chatbot', async () => {
      req.body = { query: 'test' };
      pythonClient.post.mockResolvedValue({ data: null });

      await queryChatBot(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });
  });

  // --- rebuildSearchIndex ---
  describe('rebuildSearchIndex', () => {
    it('should rebuild search index successfully', async () => {
      const mockResponse = { message: 'Index rebuilt successfully', status: 'completed' };
      pythonClient.post.mockResolvedValue({ data: mockResponse });

      await rebuildSearchIndex(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/recommend/rebuild');
      expect(res.json).toHaveBeenCalledWith(mockResponse);
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle error when rebuild fails', async () => {
      const mockError = new Error('Rebuild failed');
      pythonClient.post.mockRejectedValue(mockError);

      await rebuildSearchIndex(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/recommend/rebuild');
      expect(console.error).toHaveBeenCalledWith('Rebuild Index Error:', mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rebuilding search index failed' });
    });

    it('should handle service unavailable error', async () => {
      const serviceError = new Error('Service unavailable');
      pythonClient.post.mockRejectedValue(serviceError);

      await rebuildSearchIndex(req, res);

      expect(console.error).toHaveBeenCalledWith('Rebuild Index Error:', serviceError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rebuilding search index failed' });
    });

    it('should handle timeout during rebuild', async () => {
      const timeoutError = new Error('timeout exceeded');
      pythonClient.post.mockRejectedValue(timeoutError);

      await rebuildSearchIndex(req, res);

      expect(console.error).toHaveBeenCalledWith('Rebuild Index Error:', timeoutError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rebuilding search index failed' });
    });

    it('should handle empty response from rebuild', async () => {
      pythonClient.post.mockResolvedValue({ data: {} });

      await rebuildSearchIndex(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/recommend/rebuild');
      expect(res.json).toHaveBeenCalledWith({});
    });

    it('should handle null response from rebuild', async () => {
      pythonClient.post.mockResolvedValue({ data: null });

      await rebuildSearchIndex(req, res);

      expect(res.json).toHaveBeenCalledWith(null);
    });

    it('should handle different response structures', async () => {
      const mockResponse = { 
        success: true, 
        indexedCount: 150, 
        duration: '2.5s',
        timestamp: '2025-11-26T10:00:00Z'
      };
      pythonClient.post.mockResolvedValue({ data: mockResponse });

      await rebuildSearchIndex(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResponse);
    });
  });

  // --- Edge Cases and Additional Coverage ---
  describe('Edge Cases', () => {
    it('should handle pythonClient.get throwing synchronous error', async () => {
      pythonClient.get.mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      await getRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Hybrid recommendation failed' });
    });

    it('should handle pythonClient.post throwing synchronous error in queryChatBot', async () => {
      req.body = { query: 'test' };
      pythonClient.post.mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      await queryChatBot(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Chatbot failed' });
    });

    it('should handle pythonClient.post throwing synchronous error in rebuildSearchIndex', async () => {
      pythonClient.post.mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      await rebuildSearchIndex(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Rebuilding search index failed' });
    });

    it('should handle query with only whitespace', async () => {
      req.body = { query: '   ' };

      await queryChatBot(req, res);

      // Whitespace is truthy, so it should proceed
      expect(pythonClient.post).toHaveBeenCalledWith('/bot/query', {
        question: '   ',
        user_role: 'student',
        user_id: 'user123'
      });
    });

    it('should handle query with value 0', async () => {
      req.body = { query: 0 };

      await queryChatBot(req, res);

      // 0 is falsy, should return 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query required' });
    });

    it('should handle query with boolean false', async () => {
      req.body = { query: false };

      await queryChatBot(req, res);

      // false is falsy, should return 400
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Query required' });
    });

    it('should handle axios error with response data', async () => {
      const axiosError = {
        response: {
          status: 503,
          data: { detail: 'Service temporarily unavailable' }
        },
        message: 'Request failed with status code 503'
      };
      pythonClient.get.mockRejectedValue(axiosError);

      await getRecommendations(req, res);

      expect(console.error).toHaveBeenCalledWith('Hybrid Recommendation Error:', axiosError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Hybrid recommendation failed' });
    });

    it('should handle malformed user object in getRecommendations', async () => {
      req.user.id = null;
      pythonClient.get.mockResolvedValue({ data: {} });

      await getRecommendations(req, res);

      expect(pythonClient.get).toHaveBeenCalledWith('/recommend/hybrid/null');
    });

    it('should handle malformed user object in queryChatBot', async () => {
      req.user = { id: undefined, role: undefined };
      req.body = { query: 'test' };
      pythonClient.post.mockResolvedValue({ data: {} });

      await queryChatBot(req, res);

      expect(pythonClient.post).toHaveBeenCalledWith('/bot/query', {
        question: 'test',
        user_role: undefined,
        user_id: undefined
      });
    });
  });

  // --- Return Value Tests ---
  describe('Return Values', () => {
    it('should verify getRecommendations returns response from res.json', async () => {
      const mockData = { recommendations: ['event1'] };
      pythonClient.get.mockResolvedValue({ data: mockData });
      res.json.mockReturnValue('json_return_value');

      const result = await getRecommendations(req, res);

      expect(result).toBe('json_return_value');
    });

    it('should verify getRecommendations returns response from res.status on error', async () => {
      pythonClient.get.mockRejectedValue(new Error('test'));
      res.json.mockReturnValue('error_return_value');

      const result = await getRecommendations(req, res);

      expect(result).toBe('error_return_value');
    });

    it('should verify queryChatBot returns response from res.json on success', async () => {
      req.body = { query: 'test' };
      pythonClient.post.mockResolvedValue({ data: {} });
      res.json.mockReturnValue('chatbot_return');

      const result = await queryChatBot(req, res);

      expect(result).toBe('chatbot_return');
    });

    it('should verify queryChatBot returns response from res.status on validation error', async () => {
      req.body = {};
      res.json.mockReturnValue('validation_error_return');

      const result = await queryChatBot(req, res);

      expect(result).toBe('validation_error_return');
    });

    it('should verify queryChatBot returns response from res.status on service error', async () => {
      req.body = { query: 'test' };
      pythonClient.post.mockRejectedValue(new Error('test'));
      res.json.mockReturnValue('service_error_return');

      const result = await queryChatBot(req, res);

      expect(result).toBe('service_error_return');
    });

    it('should verify rebuildSearchIndex returns response from res.json on success', async () => {
      pythonClient.post.mockResolvedValue({ data: {} });
      res.json.mockReturnValue('rebuild_return');

      const result = await rebuildSearchIndex(req, res);

      expect(result).toBe('rebuild_return');
    });

    it('should verify rebuildSearchIndex returns response from res.status on error', async () => {
      pythonClient.post.mockRejectedValue(new Error('test'));
      res.json.mockReturnValue('rebuild_error_return');

      const result = await rebuildSearchIndex(req, res);

      expect(result).toBe('rebuild_error_return');
    });
  });
});
