import express from "express";
import {
  createTeamForEvent,
  inviteMemberToTeam,
  respondToInvitation,
  removeMemberFromTeam,
  changeMemberRole,
  getTeamDetails,
  getUserInvitations,
} from "../controllers/event_controllers/event.team.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware.authentication);

router.post("/", authMiddleware.authorizeRoles("organizer", "admin"), createTeamForEvent);

router.get("/invitations", getUserInvitations);

router.post("/invitations/respond", respondToInvitation);

router.get("/:teamId", getTeamDetails);

router.post("/:teamId/invitations", authMiddleware.authorizeRoles("organizer", "admin"), inviteMemberToTeam);

router.delete("/:teamId/members/:memberId", authMiddleware.authorizeRoles("organizer", "admin"), removeMemberFromTeam);

router.patch("/:teamId/members/:memberId", authMiddleware.authorizeRoles("organizer", "admin"), changeMemberRole);

export default router;

