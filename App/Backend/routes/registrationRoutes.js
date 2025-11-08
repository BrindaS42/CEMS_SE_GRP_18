import express from "express";
import {
  getRegistrationForm,
  submitRegistration,
  getRegistrationStatusByEIDPID,
  markCheckIn,
  updateRegistrationStatus,
} from "../../controllers/registration_controllers/registrationController.js";
import { verifyUser, verifyOrganizer } from "../../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/form/:eventId", getRegistrationForm);


router.post("/submit", verifyUser, submitRegistration);
router.get("/status/:eventId/:participantId", verifyUser, getRegistrationStatusByEIDPID);


router.post("/checkin", verifyOrganizer, markCheckIn);
router.patch("/:id/status", verifyOrganizer, updateRegistrationStatus);

export default router;
