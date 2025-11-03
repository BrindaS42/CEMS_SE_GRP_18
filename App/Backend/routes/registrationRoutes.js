import express from "express";
import {
  updateRegistrationStatus,
  getRegistrationsByEvent,
  getEventById,
} from "../controllers/registrationController.js";
import auth from "../middleware/authentication.js";

const router = express.Router();

// Organizer actions
router.put("/:id/status", auth.authentication, auth.authorizeRoles("organizer"), updateRegistrationStatus);
router.get("/event/:eventId", auth.authentication, auth.authorizeRoles("organizer"), getRegistrationsByEvent);
router.get("/event/details/:id", auth.authentication, auth.authorizeRoles("organizer"), getEventById);

export default router;
