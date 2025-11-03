import express from "express";
import { registerForEvent, markCheckIn } from "../controllers/registration_controllers/registrationController.js";
import auth from "../middleware/authentication.js";

const router = express.Router();

// Student register
router.post("/register", auth.authentication, auth.authorizeRoles("student"), registerForEvent);

// Organizer mark check-in
router.post("/checkin", auth.authentication, auth.authorizeRoles("organizer"), markCheckIn);

export default router;
