import express from "express";
import {
  getListOfAllEvents,
  getEventDetailsByID,
  addCheckInByTimeline,
  getAnnouncementsByEID,
  getListOfEventSponsorsWithListOf,
  addRatingReviewByEID,
  getListOfRatingReviewByEID,
} from "../../controllers/event_controllers/eventController.js";
import { verifyOrganizer, verifyUser } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", getListOfAllEvents);
router.get("/:eventId", getEventDetailsByID);
router.post("/:eventId/checkin", verifyOrganizer, addCheckInByTimeline);
router.get("/:eventId/announcements", getAnnouncementsByEID);
router.get("/:eventId/sponsors", getListOfEventSponsorsWithListOf);
router.post("/:eventId/rating", verifyUser, addRatingReviewByEID);
router.get("/:eventId/reviews", getListOfRatingReviewByEID);

export default router;
