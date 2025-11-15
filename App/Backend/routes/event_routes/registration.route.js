import express from "express";
import {
  getRegistrationForm,
  submitRegistration,
  getRegistrationStatusByEIDPID,
  markCheckIn,
  getRegistrationConfig,
  updateRegistrationConfig,
} from "../controllers/student/registration.controller.js";

import { protect } from "../../middleware/auth.middleware.js"; 

const router = express.Router();

router.get("/:eventId/form", protect, getRegistrationForm);

router.post("/submit", protect, submitRegistration);

router.get("/:eventId/:participantId/status", protect, getRegistrationStatusByEIDPID);

router.post("/checkin", protect, markCheckIn);

router.get("/:eventId/config", protect, getRegistrationConfig);

router.put("/:eventId/config", protect, updateRegistrationConfig);

export default router;
