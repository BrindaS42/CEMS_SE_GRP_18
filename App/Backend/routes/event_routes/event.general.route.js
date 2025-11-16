import express from "express";
import {
  getListOfAllEvents,
  getEventDetailsByID,
  addCheckInByTimeline,
  getAnnouncementsByEID,
  getListOfEventSponsorsWithListOf,
  addRatingReviewByEID,
  getListOfRatingReviewByEID,
} from "../../controllers/event_controllers/event.general.controller.js";
 
import auth from "../../middleware/auth.middleware.js"; // middleware to verify JWT, sets req.user
 
const {authentication} = auth;
const router = express.Router();
 
router.get("/", getListOfAllEvents);
router.get("/:eventId", getEventDetailsByID);
router.get("/:eventId/announcements", authentication, getAnnouncementsByEID);
router.get("/:eventId/sponsors", getListOfEventSponsorsWithListOf);
router.get("/:eventId/reviews", authentication, getListOfRatingReviewByEID);

router.post("/:eventId/rate", authentication, addRatingReviewByEID);

router.post("/:eventId/checkin", authentication, addCheckInByTimeline);

export default router;
