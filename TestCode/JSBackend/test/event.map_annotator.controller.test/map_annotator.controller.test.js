import { jest } from '@jest/globals';
import { saveEventLocation, getEventLocation } from '../../controllers/event_controllers/map_annotator.controller.js';
import Event from '../../models/event.model.js';

// Mock the Event model methods
Event.findById = jest.fn();
Event.findByIdAndUpdate = jest.fn();
Event.find = jest.fn();

describe('map_annotator.controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('saveEventLocation', () => {
    it('returns 400 when eventId is missing', async () => {
      await saveEventLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing eventId' });
      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('returns 400 when location payload is invalid', async () => {
      req.params.eventId = 'evt-1';
      req.body.location = 'not-an-object';

      await saveEventLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid location payload' });
      expect(Event.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('persists normalized location data when request is valid', async () => {
      const mockEvent = { _id: 'evt-1', location: {} };
      Event.findByIdAndUpdate.mockResolvedValue(mockEvent);

      req.params.eventId = 'evt-1';
      req.body.location = {
        address: 'Hall A',
        coordinates: { lat: 10, lng: 20 },
        mapAnnotations: [
          {
            label: 'Stage',
            description: 'Main performances',
            coordinates: { lat: 11, lng: 21 },
            icon: 'mic',
            color: '#fff',
          },
          {
            coordinates: { lat: 12, lng: 22 },
          },
        ],
      };

      await saveEventLocation(req, res);

      expect(Event.findByIdAndUpdate).toHaveBeenCalledTimes(1);
      const [calledEventId, updatePayload, options] = Event.findByIdAndUpdate.mock.calls[0];
      expect(calledEventId).toBe('evt-1');
      expect(options).toEqual({ new: true });
      expect(updatePayload.location).toEqual({
        address: 'Hall A',
        coordinates: { lat: 10, lng: 20 },
        mapAnnotations: [
          {
            label: 'Stage',
            description: 'Main performances',
            coordinates: { lat: 11, lng: 21 },
            icon: 'mic',
            color: '#fff',
          },
          {
            label: '',
            description: '',
            coordinates: { lat: 12, lng: 22 },
            icon: undefined,
            color: undefined,
          },
        ],
      });
      expect(updatePayload.updatedAt).toBeInstanceOf(Date);
      expect(res.json).toHaveBeenCalledWith({ message: 'Location saved', event: mockEvent });
    });

    it('returns 404 when event does not exist', async () => {
      Event.findByIdAndUpdate.mockResolvedValue(null);

      req.params.eventId = 'evt-2';
      req.body.location = {
        address: 'Hall B',
        coordinates: { lat: 0, lng: 0 },
        mapAnnotations: 'invalid',
      };

      await saveEventLocation(req, res);

      const [, updatePayload] = Event.findByIdAndUpdate.mock.calls[0];
      expect(updatePayload.location.mapAnnotations).toEqual([]);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('handles missing address field by using empty string', async () => {
      const mockEvent = { _id: 'evt-2a', location: {} };
      Event.findByIdAndUpdate.mockResolvedValue(mockEvent);

      req.params.eventId = 'evt-2a';
      req.body.location = {
        coordinates: { lat: 5, lng: 10 },
      };

      await saveEventLocation(req, res);

      const [, updatePayload] = Event.findByIdAndUpdate.mock.calls[0];
      expect(updatePayload.location.address).toBe('');
      expect(res.json).toHaveBeenCalledWith({ message: 'Location saved', event: mockEvent });
    });

    it('handles missing coordinates in location', async () => {
      const mockEvent = { _id: 'evt-2b', location: {} };
      Event.findByIdAndUpdate.mockResolvedValue(mockEvent);

      req.params.eventId = 'evt-2b';
      req.body.location = {
        address: 'Test Address',
      };

      await saveEventLocation(req, res);

      const [, updatePayload] = Event.findByIdAndUpdate.mock.calls[0];
      expect(updatePayload.location.coordinates.lat).toBeUndefined();
      expect(updatePayload.location.coordinates.lng).toBeUndefined();
      expect(res.json).toHaveBeenCalledWith({ message: 'Location saved', event: mockEvent });
    });

    it('handles missing coordinates in mapAnnotations', async () => {
      const mockEvent = { _id: 'evt-2c', location: {} };
      Event.findByIdAndUpdate.mockResolvedValue(mockEvent);

      req.params.eventId = 'evt-2c';
      req.body.location = {
        address: 'Test',
        coordinates: { lat: 1, lng: 2 },
        mapAnnotations: [
          { label: 'Marker 1' },
        ],
      };

      await saveEventLocation(req, res);

      const [, updatePayload] = Event.findByIdAndUpdate.mock.calls[0];
      expect(updatePayload.location.mapAnnotations[0].coordinates.lat).toBeUndefined();
      expect(updatePayload.location.mapAnnotations[0].coordinates.lng).toBeUndefined();
      expect(res.json).toHaveBeenCalledWith({ message: 'Location saved', event: mockEvent });
    });

    it('returns 500 when database update throws', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const dbError = new Error('DB failure');
      Event.findByIdAndUpdate.mockRejectedValue(dbError);

      req.params.eventId = 'evt-3';
      req.body.location = {
        address: 'Hall C',
        coordinates: { lat: 1, lng: 2 },
        mapAnnotations: [],
      };

      await saveEventLocation(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('saveEventLocation error:', dbError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      consoleSpy.mockRestore();
    });
  });

  describe('getEventLocation', () => {
    it('returns 400 when eventId is missing', async () => {
      await getEventLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Missing eventId' });
      expect(Event.findById).not.toHaveBeenCalled();
    });

    it('returns stored location when event exists', async () => {
      const mockLocation = { address: 'Hall D' };
      const selectMock = jest.fn().mockResolvedValue({ location: mockLocation });
      Event.findById.mockReturnValue({ select: selectMock });

      req.params.eventId = 'evt-4';

      await getEventLocation(req, res);

      expect(Event.findById).toHaveBeenCalledWith('evt-4');
      expect(selectMock).toHaveBeenCalledWith('location');
      expect(res.json).toHaveBeenCalledWith({ location: mockLocation });
    });

    it('returns 404 when event is not found', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      Event.findById.mockReturnValue({ select: selectMock });

      req.params.eventId = 'evt-5';

      await getEventLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
    });

    it('returns 500 when query throws', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const selectMock = jest.fn().mockRejectedValue(new Error('Query failed'));
      Event.findById.mockReturnValue({ select: selectMock });

      req.params.eventId = 'evt-6';

      await getEventLocation(req, res);

      expect(consoleSpy).toHaveBeenCalledWith('getEventLocation error:', expect.any(Error));
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Server error' });
      consoleSpy.mockRestore();
    });

    it('returns null when event has no location field', async () => {
      const mockEvent = { _id: 'evt-7' };
      const selectMock = jest.fn().mockResolvedValue(mockEvent);
      Event.findById.mockReturnValue({ select: selectMock });

      req.params.eventId = 'evt-7';

      await getEventLocation(req, res);

      expect(res.json).toHaveBeenCalledWith({ location: null });
    });
  });
});
