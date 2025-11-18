import { Router } from "express";
import auth from "../../middleware/auth.middleware.js";
import {
  createTeamForEvent,
  getAllUserDetails,
  inviteMemberToTeam,
  respondToInvitation,
  getTeamDetails,
  getUserInvitations,
  getTeamList,
  removeTeam,
  updateTeam 
} from "../../controllers/organizer_controllers/event.team.controller.js";

const { authentication, authorizeRoles, checkSuspension } = auth;

const router = Router();

router.use(authentication, authorizeRoles("organizer", "admin"));

router.post("/create",checkSuspension, createTeamForEvent);

router.get("/list", getTeamList);

router.get("/users", getAllUserDetails);

router.get("/invitations", getUserInvitations);

router.post("/invitations/respond",checkSuspension, respondToInvitation);

router.get("/:teamId", getTeamDetails);

router.post("/:teamId/invite",checkSuspension, inviteMemberToTeam);

router.delete("/:teamId",checkSuspension, removeTeam);

router.patch("/:teamId",checkSuspension, updateTeam);

export default router;