import { Router } from "express";
import auth from "../../middleware/auth.middleware.js";
import {
  createTeamForEvent,
  getAllUserDetails,
  inviteMemberToTeam,
  respondToInvitation,
  removeMemberFromTeam,
  changeMemberRole,
  getTeamDetails,
  getTeamList,
  getUserInvitations,
  updateTeam,
  removeTeam,
} from "../../controllers/organizer_controllers/event.team.controller.js";

const { authentication, authorizeRoles } = auth;

const router = Router();

// All organizer/admin only
router.use(authentication, authorizeRoles("organizer", "admin"));

router.post("/create", createTeamForEvent);
router.get("/list", getTeamList);
router.get("/users", getAllUserDetails);

router.get("/invitations", getUserInvitations);
router.post("/invitations/respond", respondToInvitation);

router.patch("/remove-member", removeMemberFromTeam);
router.patch("/change-role", updateTeam);

router.get("/:teamId", getTeamDetails);
router.patch("/:teamId", updateTeam);
router.delete("/:teamId", removeTeam);

router.post("/:teamId/invite", inviteMemberToTeam);

export default router;
