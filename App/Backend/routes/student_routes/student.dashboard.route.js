import { Router } from "express";
import auth from "../../middleware/auth.middleware.js";
import {
  FetchTheListOfRegisteredEventsByPID,
  FetchTheListOfCompletedEventsByPID,
  GetTheTimeLineReminders,
  GetClashDetectionWarnings,
  getStudentTeams,
} from "../../controllers/student_controller/student.dashboard.controller.js";

const { authentication, authorizeRoles } = auth;

const router = Router();

router.use(authentication, authorizeRoles("student"));

router.get("/my-registered-events", FetchTheListOfRegisteredEventsByPID);
router.get("/my-completed-events", FetchTheListOfCompletedEventsByPID);
router.get("/timeline-reminders", GetTheTimeLineReminders);
router.get("/clash-warnings", GetClashDetectionWarnings);
router.get("/my-teams", getStudentTeams);

export default router;
