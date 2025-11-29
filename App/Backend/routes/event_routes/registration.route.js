import express from "express";
// App/Backend/routes/event_routes/registration.route.js (Update this line)

import {
getRegistrationForm,
 submitRegistration,
 getRegistrationStatusByEIDPID,
 markCheckIn,
 getStudentTeams, 
} from "../../controllers/event_controllers/registration.controller.js";

import auth from "../../middleware/auth.middleware.js"; 

const router = express.Router();
const {authentication, authorizeRoles, checkSuspension} = auth;
router.use(authentication, checkSuspension);

router.get("/:eventId/form", authorizeRoles("student"), getRegistrationForm);

router.post("/submit", authorizeRoles("student"),submitRegistration);

router.get("/:eventId/:participantId/status", authorizeRoles("student"), getRegistrationStatusByEIDPID);

router.post("/checkin", authorizeRoles( "organizer"), markCheckIn);


router.get("/teams/my", authorizeRoles("student"), getStudentTeams); 


export default router;
