import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createTeamForEvent,
  getAllUserDetails,
  inviteMemberToTeam,
  getTeamDetails,
  getUserInvitations,
  getTeamList,
  removeTeam,
  updateTeam 
} from "../controllers/event_controllers/event.team.controller.js";

const { authentication, authorizeRoles } = auth;

const router = Router();

router.use(authentication, authorizeRoles("organizer", "admin"));

router.post("/create", createTeamForEvent);

router.get("/list", getTeamList);

router.get("/users", getAllUserDetails);

router.get("/invitations", getUserInvitations);

router.get("/:teamId", getTeamDetails);

router.post("/:teamId/invite", inviteMemberToTeam);

router.delete("/:teamId", removeTeam);

router.patch("/:teamId", updateTeam);

export default router;