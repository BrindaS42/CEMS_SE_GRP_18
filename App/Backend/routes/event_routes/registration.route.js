import express from "express";
import {
  getRegistrationForm,
  submitRegistration,
  getRegistrationStatusByEIDPID,
  markCheckIn,
} from "../../controllers/event_controllers/registration.controller.js";

import auth from "../../middleware/auth.middleware.js"; 

const router = express.Router();
const {authentication, authorizeRoles} = auth;
router.get("/:eventId/form", authentication, authorizeRoles("student"), getRegistrationForm);

router.post("/submit", authentication, authorizeRoles("student"),submitRegistration);

router.get("/:eventId/:participantId/status", authentication, authorizeRoles("student"), getRegistrationStatusByEIDPID);

router.post("/checkin", authentication, authorizeRoles( "organizer"), markCheckIn);

export default router;
