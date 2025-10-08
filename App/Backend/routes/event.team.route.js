import { Router } from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createTeamForEvent,
  getAllUserDetails,
  inviteMemberToTeam,
  respondToInvitation,
  removeMemberFromTeam,
  changeMemberRole,
  getTeamDetails,
  getUserInvitations,
} from "../controllers/event_controllers/event.team.controller.js";

const { authentication, authorizeRoles } = auth;

const router = Router();

router.use(authentication, authorizeRoles("organizer", "admin"));

router.post("/create", createTeamForEvent);

router.get("/users", getAllUserDetails);

router.get("/invitations", getUserInvitations);

router.post("/invitations/respond", respondToInvitation);

router.patch("/remove-member", removeMemberFromTeam);

router.patch("/change-role", changeMemberRole);

router.get("/:teamId", getTeamDetails);

router.post("/:teamId/invite", inviteMemberToTeam);

export default router;