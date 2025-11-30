import { jest } from '@jest/globals';

// Mock the socket service before importing - must be hoisted
jest.unstable_mockModule('../../services/socket.service.js', () => ({
  getIo: jest.fn()
}));

const { fetchAllMessages, postMessage } = await import('../../controllers/event_controllers/chatroom.controller.js');
const Event = (await import('../../models/event.model.js')).default;
const { getIo: mockGetIo } = await import('../../services/socket.service.js');

// Mock the Event model methods
Event.findById = jest.fn();
Event.findByIdAndUpdate = jest.fn();
Event.find = jest.fn();

describe('chatroom.controller', () => {
  let req;
  let res;
  let mockIo;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('fetchAllMessages', () => {
    it('returns 404 when event does not exist', async () => {
      const mockPopulate = jest.fn().mockResolvedValue(null);
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      Event.findById.mockReturnValue({ select: mockSelect });

      req.params.eventId = 'nonexistent-id';

      await fetchAllMessages(req, res);

      expect(Event.findById).toHaveBeenCalledWith('nonexistent-id');
      expect(mockSelect).toHaveBeenCalledWith('chatRoom');
      expect(mockPopulate).toHaveBeenCalledWith('chatRoom.sender', 'profile role');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
    });

    it('returns chatRoom messages when event exists', async () => {
      const mockChatRoom = [
        {
          sender: { _id: 'user1', profile: { name: 'Alice' }, role: 'student' },
          message: 'Hello everyone',
          createdAt: new Date('2025-11-20T10:00:00Z'),
        },
        {
          sender: { _id: 'user2', profile: { name: 'Bob' }, role: 'organizer' },
          message: 'Welcome!',
          createdAt: new Date('2025-11-20T10:05:00Z'),
        },
      ];
      const mockEvent = { chatRoom: mockChatRoom };
      const mockPopulate = jest.fn().mockResolvedValue(mockEvent);
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      Event.findById.mockReturnValue({ select: mockSelect });

      req.params.eventId = 'evt-123';

      await fetchAllMessages(req, res);

      expect(Event.findById).toHaveBeenCalledWith('evt-123');
      expect(mockSelect).toHaveBeenCalledWith('chatRoom');
      expect(mockPopulate).toHaveBeenCalledWith('chatRoom.sender', 'profile role');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockChatRoom);
    });

    it('returns empty chatRoom array when no messages exist', async () => {
      const mockEvent = { chatRoom: [] };
      const mockPopulate = jest.fn().mockResolvedValue(mockEvent);
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      Event.findById.mockReturnValue({ select: mockSelect });

      req.params.eventId = 'evt-456';

      await fetchAllMessages(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('returns 500 when database query fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const dbError = new Error('Database connection failed');
      const mockPopulate = jest.fn().mockRejectedValue(dbError);
      const mockSelect = jest.fn().mockReturnValue({ populate: mockPopulate });
      Event.findById.mockReturnValue({ select: mockSelect });

      req.params.eventId = 'evt-789';

      await fetchAllMessages(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('[Chat Controller] ❌ Error fetching messages:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error while fetching messages' });
      consoleSpy.mockRestore();
    });
  });

  describe('postMessage', () => {
    it('returns 400 when message is missing', async () => {
      req.params.eventId = 'evt-100';
      req.user.id = 'user-1';
      req.body.message = '';

      await postMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Message content is required' });
      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('returns 400 when message contains only whitespace', async () => {
      req.params.eventId = 'evt-101';
      req.user.id = 'user-2';
      req.body.message = '   ';

      await postMessage(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Message content is required' });
      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('returns 404 when event does not exist', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      Event.findByIdAndUpdate.mockResolvedValue(null);

      req.params.eventId = 'evt-102';
      req.user.id = 'user-3';
      req.body.message = 'Test message';

      await postMessage(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
        'evt-102',
        {
          $push: {
            chatRoom: {
              sender: 'user-3',
              message: 'Test message',
              createdAt: expect.any(Date),
            },
          },
        },
        { new: true, fields: { chatRoom: 1 } }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Event not found' });
      consoleSpy.mockRestore();
    });

    it('posts message successfully and emits socket event', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockGetIo.mockReturnValue(mockIo);

      const newMessageObj = {
        sender: { _id: 'user-4', profile: { name: 'Charlie' }, role: 'student' },
        message: 'Great event!',
        createdAt: new Date('2025-11-22T12:00:00Z'),
        toObject: jest.fn().mockReturnValue({
          sender: { _id: 'user-4', profile: { name: 'Charlie' }, role: 'student' },
          message: 'Great event!',
          createdAt: new Date('2025-11-22T12:00:00Z'),
        }),
      };

      const mockUpdatedEvent = {
        chatRoom: [newMessageObj],
        populate: jest.fn().mockResolvedValue({
          chatRoom: [newMessageObj],
        }),
      };

      Event.findByIdAndUpdate.mockResolvedValue(mockUpdatedEvent);

      req.params.eventId = 'evt-103';
      req.user.id = 'user-4';
      req.body.message = 'Great event!';

      await postMessage(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
        'evt-103',
        {
          $push: {
            chatRoom: {
              sender: 'user-4',
              message: 'Great event!',
              createdAt: expect.any(Date),
            },
          },
        },
        { new: true, fields: { chatRoom: 1 } }
      );
      expect(mockUpdatedEvent.populate).toHaveBeenCalledWith({
        path: 'chatRoom.sender',
        select: 'profile role',
      });
      expect(mockGetIo).toHaveBeenCalled();
      expect(mockIo.to).toHaveBeenCalledWith('evt-103');
      expect(mockIo.emit).toHaveBeenCalledWith('receive_message', {
        sender: { _id: 'user-4', profile: { name: 'Charlie' }, role: 'student' },
        message: 'Great event!',
        createdAt: expect.any(Date),
        eventId: 'evt-103',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        sender: { _id: 'user-4', profile: { name: 'Charlie' }, role: 'student' },
        message: 'Great event!',
        createdAt: expect.any(Date),
        eventId: 'evt-103',
      });
      consoleSpy.mockRestore();
    });

    it('handles message with multiple messages in chatRoom', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockGetIo.mockReturnValue(mockIo);

      const existingMessage = {
        sender: { _id: 'user-5', profile: { name: 'Dave' }, role: 'organizer' },
        message: 'First message',
        createdAt: new Date('2025-11-22T11:00:00Z'),
        toObject: jest.fn().mockReturnValue({
          sender: { _id: 'user-5', profile: { name: 'Dave' }, role: 'organizer' },
          message: 'First message',
          createdAt: new Date('2025-11-22T11:00:00Z'),
        }),
      };

      const newMessageObj = {
        sender: { _id: 'user-6', profile: { name: 'Eve' }, role: 'student' },
        message: 'Second message',
        createdAt: new Date('2025-11-22T12:30:00Z'),
        toObject: jest.fn().mockReturnValue({
          sender: { _id: 'user-6', profile: { name: 'Eve' }, role: 'student' },
          message: 'Second message',
          createdAt: new Date('2025-11-22T12:30:00Z'),
        }),
      };

      const mockUpdatedEvent = {
        chatRoom: [existingMessage, newMessageObj],
        populate: jest.fn().mockResolvedValue({
          chatRoom: [existingMessage, newMessageObj],
        }),
      };

      Event.findByIdAndUpdate.mockResolvedValue(mockUpdatedEvent);

      req.params.eventId = 'evt-104';
      req.user.id = 'user-6';
      req.body.message = 'Second message';

      await postMessage(req, res);

      const emittedMessage = mockIo.emit.mock.calls[0][1];
      expect(emittedMessage.message).toBe('Second message');
      expect(emittedMessage.sender._id).toBe('user-6');
      expect(emittedMessage.eventId).toBe('evt-104');
      consoleSpy.mockRestore();
    });

    it('returns 500 when database update fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
      const dbError = new Error('Update failed');
      Event.findByIdAndUpdate.mockRejectedValue(dbError);

      req.params.eventId = 'evt-105';
      req.user.id = 'user-7';
      req.body.message = 'Error test';

      await postMessage(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('[Chat Controller] ❌ Error posting message:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error while posting message' });
      consoleSpy.mockRestore();
    });

    it('logs correct console messages during execution', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      mockGetIo.mockReturnValue(mockIo);

      const newMessageObj = {
        sender: { _id: 'user-8', profile: { name: 'Frank' }, role: 'student' },
        message: 'Logging test',
        createdAt: new Date('2025-11-22T13:00:00Z'),
        toObject: jest.fn().mockReturnValue({
          sender: { _id: 'user-8', profile: { name: 'Frank' }, role: 'student' },
          message: 'Logging test',
          createdAt: new Date('2025-11-22T13:00:00Z'),
        }),
      };

      const mockUpdatedEvent = {
        chatRoom: [newMessageObj],
        populate: jest.fn().mockResolvedValue({
          chatRoom: [newMessageObj],
        }),
      };

      Event.findByIdAndUpdate.mockResolvedValue(mockUpdatedEvent);

      req.params.eventId = 'evt-106';
      req.user.id = 'user-8';
      req.body.message = 'Logging test';

      await postMessage(req, res);

      expect(consoleLogSpy).toHaveBeenCalledWith('[Chat Controller] ➡️ Received message post for event: evt-106');
      expect(consoleLogSpy).toHaveBeenCalledWith('[Chat Controller] 📡 Emitting \'receive_message\' to room: evt-106');
      consoleLogSpy.mockRestore();
    });
  });
});
