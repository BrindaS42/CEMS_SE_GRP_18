import express from "express";
import {
  getListOfAllEvents,
  getEventDetailsByID,
  addCheckInByTimeline,
  getAnnouncementsByEID,
  getListOfEventSponsorsWithListOf,
  addRatingReviewByEID,
  getListOfRatingReviewByEID,
} from "../controllers/student/event.controller.js";

import { protect } from "../../middleware/auth.middleware.js"; // middleware to verify JWT, sets req.user

const router = express.Router();

router.get("/", getListOfAllEvents);
router.get("/:eventId", getEventDetailsByID);
router.get("/:eventId/announcements", getAnnouncementsByEID);
router.get("/:eventId/sponsors", getListOfEventSponsorsWithListOf);
router.get("/:eventId/reviews", getListOfRatingReviewByEID);

router.post("/:eventId/rate", protect, addRatingReviewByEID);

router.post("/:eventId/checkin", protect, addCheckInByTimeline);

export default router;
