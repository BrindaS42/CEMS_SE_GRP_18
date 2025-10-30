import express from "express";
import { getEventById, markCheckIn } from "../controllers/eventController.js";
import auth from "../middleware/authentication.js";

const router = express.Router();

router.get("/:id", getEventById);
router.post("/:eventId/checkin", auth.authentication, auth.authorizeRoles("organizer"), markCheckIn);

export default router;
