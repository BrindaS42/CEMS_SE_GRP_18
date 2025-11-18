import express from "express";
import {
  getRegistrationForm,
  submitRegistration,
  getRegistrationStatusByEIDPID,
  markCheckIn,
} from "../../controllers/event_controllers/registration.controller.js";

import auth from "../../middleware/auth.middleware.js"; 

const router = express.Router();
const {authentication, authorizeRoles, checkSuspension} = auth;
router.use(authentication, checkSuspension);

router.get("/:eventId/form", authorizeRoles("student"), getRegistrationForm);

router.post("/submit", authorizeRoles("student"),submitRegistration);

router.get("/:eventId/:participantId/status", authorizeRoles("student"), getRegistrationStatusByEIDPID);

router.post("/checkin", authorizeRoles( "organizer"), markCheckIn);

export default router;
