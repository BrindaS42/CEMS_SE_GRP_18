import express from "express";
import {
  GetAllSponsorNameDescpNoOfEsponsred,
    GetAllAdsBySpID,
} from "../controllers/sponser-featch.controller.js";
import auth from "../middleware/auth.middleware.js";
const { authentication, authorizeRoles } = auth;

const router = express.Router();
router.get(
  "/list",
  authentication,
  authorizeRoles("organizer", "admin"),
  GetAllSponsorNameDescpNoOfEsponsred
);

router.get(
  "/:sponsorId/ads",
  authentication,
  authorizeRoles("sponsor", "organizer", "admin"),
  GetAllAdsBySpID
);

export default router;
