import { jest } from '@jest/globals';
import {
  getEventsForUser,
  getPublishedEvents,
  getDraftEvents,
  getRegistrationLogs,
  getCheckIns,
  fetchCompletedEvents,
  getRegisteredStudentsByEID,
  getAttendeesByEID,
  getReviewRatingsByEID,
  getOrganizerTeams,
  addAnnouncement,
  editAnnouncement,
  deleteAnnouncement,
  populateEventDetails
} from '../../controllers/organizer_controllers/organizer.dashboard.controller.js';

import Event from "../../models/event.model.js";
import Team from "../../models/organizerTeam.model.js";
import Registration from "../../models/registration.model.js";

// Mock the model functions
Event.find = jest.fn();
Event.findById = jest.fn();
Event.findByIdAndUpdate = jest.fn();
Team.find = jest.fn();
Registration.find = jest.fn();

describe("Event Controller", () => {
  let req, res;

  // Helper to mock mongoose chainable queries
  const mockMongooseChain = (resolvedValue) => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(resolvedValue),
    };
    return chain;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      user: { id: "user123" },
      params: {},
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getEventsForUser", () => {
    it("should return 401 if user is unauthenticated", async () => {
      req.user = null;
      await getEventsForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthenticated" });
    });

    it("should return events for the user's teams", async () => {
      // Mock Team.find (getUserTeamIds helper)
      const mockTeams = [{ _id: "team1" }, { _id: "team2" }];
      const teamChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockTeams),
      };
      Team.find.mockReturnValue(teamChain);

      // Mock Event.find
      const mockEvents = [{ title: "Event 1" }];
      const eventChain = mockMongooseChain(mockEvents);
      Event.find.mockReturnValue(eventChain);

      await getEventsForUser(req, res);

      // Verify Team query
      expect(Team.find).toHaveBeenCalledWith({
        $or: [{ leader: "user123" }, { "members.user": "user123" }],
      });

      // Verify Event query
      expect(Event.find).toHaveBeenCalledWith({ createdBy: { $in: ["team1", "team2"] } });
      expect(eventChain.select).toHaveBeenCalled();
      expect(eventChain.populate).toHaveBeenCalledWith(populateEventDetails);
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it("should handle errors (500)", async () => {
      // Mock Team error
      Team.find.mockImplementation(() => { throw new Error("DB Error"); });
      await getEventsForUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB Error" });
    });
  });

  describe("getPublishedEvents", () => {
    it("should return published events", async () => {
      const mockTeams = [{ _id: "team1" }];
      Team.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockTeams),
      });

      const mockEvents = [{ title: "Pub Event" }];
      const eventChain = mockMongooseChain(mockEvents);
      Event.find.mockReturnValue(eventChain);

      await getPublishedEvents(req, res);

      expect(Event.find).toHaveBeenCalledWith({
        createdBy: { $in: ["team1"] },
        status: "published",
      });
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it("should handle errors", async () => {
        Team.find.mockImplementation(() => { throw new Error("DB Fail"); });
        await getPublishedEvents(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getDraftEvents", () => {
    it("should return draft events", async () => {
      const mockTeams = [{ _id: "team1" }];
      Team.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockTeams),
      });

      const mockEvents = [{ title: "Draft Event" }];
      const eventChain = mockMongooseChain(mockEvents);
      Event.find.mockReturnValue(eventChain);

      await getDraftEvents(req, res);

      expect(Event.find).toHaveBeenCalledWith({
        createdBy: { $in: ["team1"] },
        status: "draft",
      });
      expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it("should handle errors", async () => {
        Team.find.mockImplementation(() => { throw new Error("DB Fail"); });
        await getDraftEvents(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("Stubs (getRegistrationLogs / getCheckIns)", () => {
    it("getRegistrationLogs should return empty array", async () => {
      await getRegistrationLogs(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("getRegistrationLogs should handle errors", async () => {
       // Since the function is just res.json([]), hard to error without mocking res.json to throw
       res.json.mockImplementationOnce(() => { throw new Error("Stub Error"); });
       await getRegistrationLogs(req, res);
       expect(res.status).toHaveBeenCalledWith(500);
    });

    it("getCheckIns should return empty array", async () => {
      await getCheckIns(req, res);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("getCheckIns should handle errors", async () => {
        res.json.mockImplementationOnce(() => { throw new Error("Stub Error"); });
        await getCheckIns(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
     });
  });

  describe("fetchCompletedEvents", () => {
    it("should fetch completed events sorted by date", async () => {
        const mockTeams = [{ _id: "team1" }];
        Team.find.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockTeams),
        });

        const mockEvents = [{ title: "Done Event" }];
        const eventChain = mockMongooseChain(mockEvents);
        Event.find.mockReturnValue(eventChain);

        await fetchCompletedEvents(req, res);

        expect(Event.find).toHaveBeenCalledWith({
            createdBy: { $in: ["team1"] },
            status: "completed",
        });
        expect(eventChain.sort).toHaveBeenCalledWith({ updatedAt: -1 });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockEvents);
    });

    it("should handle errors", async () => {
        Team.find.mockImplementation(() => { throw new Error("Err"); });
        await fetchCompletedEvents(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Server error while fetching completed events." }));
    });
  });

  describe("getRegisteredStudentsByEID", () => {
    it("should return registrations", async () => {
        req.params.eventId = "evt1";
        const mockRegs = [{ _id: "reg1" }];
        const chain = {
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockRegs)
        };
        Registration.find.mockReturnValue(chain);

        await getRegisteredStudentsByEID(req, res);

        expect(Registration.find).toHaveBeenCalledWith({ eventId: "evt1" });
        expect(chain.populate).toHaveBeenCalledWith({
          path: "userId",
          select: "profile.name profile.contactNo email",
        });
        expect(chain.populate).toHaveBeenCalledWith({
          path: "teamName",
          select: "teamName leader",
        });
        expect(chain.select).toHaveBeenCalledWith("-checkInCode");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockRegs);
    });

    it("should return empty array if no registrations found", async () => {
        req.params.eventId = "evt1";
        const chain = {
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([])
        };
        Registration.find.mockReturnValue(chain);

        await getRegisteredStudentsByEID(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });
    
    // Covering null return case explicitly
    it("should return empty array if results are null", async () => {
        req.params.eventId = "evt1";
        const chain = {
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(null)
        };
        Registration.find.mockReturnValue(chain);

        await getRegisteredStudentsByEID(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should handle errors with correct message", async () => {
        req.params.eventId = "evt1";
        Registration.find.mockImplementation(() => { throw new Error("Reg Fail"); });
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await getRegisteredStudentsByEID(req, res);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching registered students:", expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server error while fetching registered students.",
          error: "Reg Fail"
        });
        
        consoleErrorSpy.mockRestore();
    });
  });

  describe("getAttendeesByEID", () => {
    it("should return 404 if event not found", async () => {
        req.params.eventId = "evt1";
        const selectChain = {
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(null)
        };
        Event.findById.mockReturnValue(selectChain);

        await getAttendeesByEID(req, res);
        
        expect(Event.findById).toHaveBeenCalledWith("evt1");
        expect(selectChain.select).toHaveBeenCalledWith('timeline');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
    });

    it("should return timeline attendees successfully", async () => {
        req.params.eventId = "evt1";
        const mockTimeline = [{ _id: "t1", title: "Keynote", date: "2023" }];
        
        // Mock Event
        Event.findById.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue({ _id: "evt1", timeline: mockTimeline })
        });

        // Mock Registration query inside the map
        const mockAttendees = [{ userId: "u1" }];
        const regChain = {
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockAttendees)
        };
        Registration.find.mockReturnValue(regChain);

        await getAttendeesByEID(req, res);

        expect(Registration.find).toHaveBeenCalledWith({
            eventId: "evt1",
            'checkIns.timelineRef': "t1",
            'checkIns.status': 'present'
        });
        expect(regChain.populate).toHaveBeenCalledWith({
          path: 'userId',
          select: 'profile.name email'
        });
        expect(regChain.select).toHaveBeenCalledWith('userId checkIns');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({
                timeline: expect.objectContaining({ _id: "t1" }),
                attendees: mockAttendees
            })
        ]));
    });

    it("should handle no attendees found (empty timeline results)", async () => {
        req.params.eventId = "evt1";
        
        Event.findById.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue({ _id: "evt1", timeline: [] })
        });

        await getAttendeesByEID(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "No attendees recorded yet.", attendees: [] });
    });

    it("should handle errors with correct message", async () => {
        req.params.eventId = "evt1";
        Event.findById.mockImplementation(() => { throw new Error("Boom"); });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await getAttendeesByEID(req, res);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching timeline-wise attendees:", expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server error while fetching attendees.",
          error: "Boom"
        });
        
        consoleErrorSpy.mockRestore();
    });
  });

  describe("getReviewRatingsByEID", () => {
    it("should return ratings", async () => {
        req.params.eventId = "evt1";
        const mockEventData = { ratings: [{ stars: 5 }] };
        const chain = {
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockEventData)
        };
        Event.findById.mockReturnValue(chain);

        await getReviewRatingsByEID(req, res);
        
        expect(Event.findById).toHaveBeenCalledWith("evt1");
        expect(chain.select).toHaveBeenCalledWith("ratings");
        expect(chain.populate).toHaveBeenCalledWith({
          path: "ratings",
          populate: {
            path: "by",
            select: "profile.name profile.profilePic",
          },
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockEventData.ratings);
    });

    it("should return 404 if event not found", async () => {
        req.params.eventId = "evt1";
        Event.findById.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(null)
        });

        await getReviewRatingsByEID(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Event not found." });
    });

    it("should return empty array if ratings is undefined but event exists", async () => {
        req.params.eventId = "evt1";
        Event.findById.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue({ }) // No ratings field
        });
        await getReviewRatingsByEID(req, res);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should handle errors with correct message", async () => {
        req.params.eventId = "evt1";
        Event.findById.mockImplementation(() => { throw new Error("Err"); });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await getReviewRatingsByEID(req, res);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching ratings and reviews:", expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server error while fetching ratings and reviews.",
          error: "Err"
        });
        
        consoleErrorSpy.mockRestore();
    });
  });

  describe("getOrganizerTeams", () => {
    it("should return teams", async () => {
        const mockTeams = [{ name: "Team A" }];
        const chain = {
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockTeams)
        };
        Team.find.mockReturnValue(chain);

        await getOrganizerTeams(req, res);
        
        expect(Team.find).toHaveBeenCalledWith({
          $or: [{ leader: "user123" }, { "members.user": "user123" }],
        });
        expect(chain.select).toHaveBeenCalledWith("name leader members");
        expect(chain.populate).toHaveBeenCalledWith("leader", "profile.name email college");
        expect(chain.populate).toHaveBeenCalledWith("members.user", "profile.name email");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockTeams);
    });

    it("should return empty array if no teams found", async () => {
        Team.find.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue([])
        });

        await getOrganizerTeams(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should return empty array if teams is null", async () => {
        Team.find.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(null)
        });

        await getOrganizerTeams(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should handle errors with correct message", async () => {
        Team.find.mockImplementation(() => { throw new Error("Err"); });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await getOrganizerTeams(req, res);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching organizer teams:", expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server error while fetching organizer teams.",
          error: "Err"
        });
        
        consoleErrorSpy.mockRestore();
    });
  });

  describe("addAnnouncement", () => {
    it("should validation error if message missing", async () => {
        req.params.eventId = "evt1";
        req.body = { title: "T" }; // no message
        await addAnnouncement(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Announcement message is required." });
    });

    it("should add announcement successfully", async () => {
        req.params.eventId = "evt1";
        req.body = { title: "T", message: "Msg", date: "2023-01-01", time: "10:00" };
        
        const mockUpdatedEvent = { _id: "evt1", announcements: [] };
        const chain = {
            populate: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb(mockUpdatedEvent))
        };

        Event.findByIdAndUpdate.mockReturnValue(chain);

        await addAnnouncement(req, res);

        expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
            "evt1",
            { 
                $push: { 
                    announcements: expect.objectContaining({
                        title: "T",
                        message: "Msg",
                        author: "user123"
                    }) 
                } 
            },
            { new: true, runValidators: true }
        );
        expect(chain.populate).toHaveBeenCalledWith(populateEventDetails);
        expect(chain.populate).toHaveBeenCalledWith({ 
          path: 'announcements.author', 
          select: 'profile.name email _id' 
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Announcement added successfully.",
          event: mockUpdatedEvent,
        });
    });

    it("should default title and date if not provided", async () => {
        req.params.eventId = "evt1";
        req.body = { message: "Msg" };
        
        Event.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve({ _id: "evt1" })
        });

        await addAnnouncement(req, res);

        expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
            expect.anything(),
            { 
                $push: { 
                    announcements: expect.objectContaining({
                        title: "Update", // default
                        message: "Msg"
                        // date check is hard because it's new Date(), verify it exists
                    }) 
                } 
            },
            expect.anything()
        );
    });

    it("should return 404 if event not found", async () => {
        req.params.eventId = "evt1";
        req.body = { message: "Msg" };
        
        Event.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve(null)
        });

        await addAnnouncement(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Event not found." });
    });

    it("should handle errors with all console logs", async () => {
        req.params.eventId = "evt1";
        req.body = { message: "Msg" };
        
        const mockError = new Error("Err");
        mockError.name = "ValidationError";
        mockError.errors = { field: "error detail" };
        
        Event.findByIdAndUpdate.mockImplementation(() => { throw mockError; });
        
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await addAnnouncement(req, res);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error adding announcement:", mockError);
        expect(consoleErrorSpy).toHaveBeenCalledWith("Mongoose Error Name:", "ValidationError");
        expect(consoleErrorSpy).toHaveBeenCalledWith("Mongoose Error Message:", "Err");
        expect(consoleErrorSpy).toHaveBeenCalledWith("Mongoose Error Details (if validation):", { field: "error detail" });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server error while adding announcement.",
          error: "Err"
        });
        
        consoleErrorSpy.mockRestore();
    });
  });

  describe("editAnnouncement", () => {
    it("should return 400 if message is missing", async () => {
        req.params = { eventId: "e1", announcementId: "a1" };
        req.body = { title: "T" };
        await editAnnouncement(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Announcement message is required." });
    });

    it("should edit announcement successfully", async () => {
        req.params = { eventId: "e1", announcementId: "a1" };
        req.body = { title: "T", message: "M", date: "D", time: "Tm" };
        
        const mockEvt = { _id: "e1" };
        const chain = {
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve(mockEvt)
        };
        Event.findByIdAndUpdate.mockReturnValue(chain);

        await editAnnouncement(req, res);

        const updatePath = "announcements.$[elem]";
        expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
            "e1",
            {
                $set: {
                    [updatePath]: {
                        title: "T",
                        message: "M",
                        date: "D",
                        time: "Tm",
                        author: "user123"
                    }
                }
            },
            {
                new: true,
                runValidators: true,
                arrayFilters: [{ "elem._id": "a1" }]
            }
        );
        expect(chain.populate).toHaveBeenCalledWith(populateEventDetails);
        expect(chain.populate).toHaveBeenCalledWith({ 
          path: 'announcements.author', 
          select: 'profile.name email _id' 
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Announcement updated successfully.",
          event: mockEvt,
        });
    });

    it("should return 404 if event/announcement not found", async () => {
        req.params = { eventId: "e1", announcementId: "a1" };
        req.body = { message: "M" };
        
        Event.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve(null)
        });

        await editAnnouncement(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Event or Announcement not found." });
    });

    it("should handle errors with correct message", async () => {
        req.params = { eventId: "e1", announcementId: "a1" };
        req.body = { message: "M" };
        Event.findByIdAndUpdate.mockImplementation(() => { throw new Error("Err"); });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await editAnnouncement(req, res);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error editing announcement:", expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server error while editing announcement.",
          error: "Err"
        });
        
        consoleErrorSpy.mockRestore();
    });
  });

  describe("deleteAnnouncement", () => {
    it("should delete announcement", async () => {
        req.params = { eventId: "e1", announcementId: "a1" };
        const mockEvt = { _id: "e1" };
        const chain = {
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve(mockEvt)
        };
        
        Event.findByIdAndUpdate.mockReturnValue(chain);

        await deleteAnnouncement(req, res);

        expect(Event.findByIdAndUpdate).toHaveBeenCalledWith(
            "e1",
            { $pull: { announcements: { _id: "a1" } } },
            { new: true }
        );
        expect(chain.populate).toHaveBeenCalledWith(populateEventDetails);
        expect(chain.populate).toHaveBeenCalledWith({ 
          path: 'announcements.author', 
          select: 'profile.name email _id' 
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Announcement deleted successfully.",
          event: mockEvt,
        });
    });

    it("should return 404 if event not found", async () => {
        req.params = { eventId: "e1", announcementId: "a1" };
        Event.findByIdAndUpdate.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            then: (resolve) => resolve(null)
        });

        await deleteAnnouncement(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Event not found." });
    });

    it("should handle errors with correct message", async () => {
        req.params = { eventId: "e1", announcementId: "a1" };
        Event.findByIdAndUpdate.mockImplementation(() => { throw new Error("Err"); });
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        
        await deleteAnnouncement(req, res);
        
        expect(consoleErrorSpy).toHaveBeenCalledWith("Error deleting announcement:", expect.any(Error));
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Server error while deleting announcement.",
          error: "Err"
        });
        
        consoleErrorSpy.mockRestore();
    });
  });
});