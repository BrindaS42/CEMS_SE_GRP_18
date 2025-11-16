import express from "express";
import {
  getUsersPerCollege,
  getRegistrationStats,
  getEventStats,
} from "../controllers/admin.dashboard.controller";

const router = express.Router();

router.get("/users-per-college", getUsersPerCollege);
router.post("/event-pub-com", getEventStats);
router.post("/registrations", getRegistrationStats);

export default router;
