import express from "express";
import {
  saveEvent,
  publishEvent,
  editEvent,
  deleteEvent,
  getEventById,
  getPotentialSubEvents,
  completeEvent
} from "../../controllers/organizer_controllers/event.manage.controller.js";
import { saveEventLocation, getEventLocation } from "../../controllers/event_controllers/map_annotator.controller.js"
import authMiddleware from '../../middleware/auth.middleware.js'; 
const { authentication, authorizeRoles } = authMiddleware;

import { 
    fetchCompletedEvents,
    getRegisteredStudentsByEID ,
    getAttendeesByEID,
    getReviewRatingsByEID,
    getOrganizerTeams,
    addAnnouncement, 
    editAnnouncement, 
    deleteAnnouncement
} from '../../controllers/organizer_controllers/organizer.dashboard.controller.js';
const router = express.Router();
router.post("/:eventId/location", saveEventLocation);
router.get("/:eventId/location", getEventLocation);

router.route('/events/completed').get(authentication, authorizeRoles('organizer'), fetchCompletedEvents);
router.route('/events/:eventId/registrations').get(authentication, authorizeRoles('organizer'), getRegisteredStudentsByEID);
router.route('/events/:eventId/attendees').get(authentication, authorizeRoles('organizer'), getAttendeesByEID);
router.route('/events/:eventId/ratings').get(authentication, authorizeRoles('organizer'), getReviewRatingsByEID);
router.route('/teams').get(authentication, authorizeRoles('organizer'), getOrganizerTeams);         
router.route('/my-teams').get(authentication, authorizeRoles('organizer'), getOrganizerTeams); 
router.route('/events/:eventId/announcements')
    .post(authentication, authorizeRoles('organizer'), addAnnouncement);  
router.route('/events/:eventId/announcements/:announcementId')
    .put(authentication, authorizeRoles('organizer'), editAnnouncement) 
    .delete(authentication, authorizeRoles('organizer'), deleteAnnouncement);
router.post("/save", saveEvent);
router.post("/publish", publishEvent);
router.put("/edit/:id", editEvent);
router.put("/complete/:id", authentication, authorizeRoles('organizer'), completeEvent);
router.delete("/delete/:id", deleteEvent);
router.get("/:id", getEventById);

router.get("/sub-events/potential/:teamId", authentication, authorizeRoles('organizer'), getPotentialSubEvents);
export default router;
