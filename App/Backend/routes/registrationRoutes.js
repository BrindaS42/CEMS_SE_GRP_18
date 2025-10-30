import express from "express";
import {
  registerForEvent,
  updateRegistrationStatus,
  getRegistrationsByEvent,
} from "../controllers/registrationController.js";
import auth from "../middleware/authentication.js";

const router = express.Router();

router.post("/", auth.authentication, auth.authorizeRoles("student"), registerForEvent);
router.put("/:id/status", auth.authentication, auth.authorizeRoles("organizer"), updateRegistrationStatus);
router.get("/event/:eventId", auth.authentication, auth.authorizeRoles("organizer"), getRegistrationsByEvent);

export default router;
