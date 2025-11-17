import express from "express";
import {
  GetAllSponsorNameDescpNoOfEsponsred,
    GetAllAdsBySpID,
    GetSponsorByID,
} from "../../controllers/sponsor_controllers/sponsor.controller.js";
import auth from "../../middleware/auth.middleware.js";
const { authentication, authorizeRoles } = auth;

const router = express.Router();
router.get(
  "/list", // Made public for all users to view sponsors
  GetAllSponsorNameDescpNoOfEsponsred
);

router.get(
  "/:sponsorId/ads",
  // Made public for all users to view sponsor ads
  GetAllAdsBySpID
);

router.get(
  "/:sponsorId", // Made public for all users to view sponsor details
  GetSponsorByID
);

export default router;
