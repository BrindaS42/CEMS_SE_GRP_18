import express from "express";
import {
  registerForEvent,
  updateRegistrationStatus,
  getRegistrationsByEvent,
  getRegistrationConfig,
} from "../controllers/registrationController.js";
import auth from "../middleware/authentication.js";

const router = express.Router();

router.get("/config/:eventId", getRegistrationConfig);
router.post("/", auth.authentication, auth.authorizeRoles("student"), registerForEvent);
router.put("/:id/status", auth.authentication, auth.authorizeRoles("organizer"), updateRegistrationStatus);
router.get("/event/:eventId", auth.authentication, auth.authorizeRoles("organizer"), getRegistrationsByEvent);

export default router;
