import express from "express";
import {
  GetAllSponsorNameDescpNoOfEsponsred,
    GetAllAdsBySpID,
    GetSponsorByID,
    GetAdByID,
    incrementAdViewCount,
    toggleAdLike,
} from "../../controllers/sponsor_controllers/sponsor.controller.js";
import auth from "../../middleware/auth.middleware.js";
const { authentication, authorizeRoles } = auth;

const router = express.Router();
router.get(
  "/list", // Made public for all users to view sponsors
  GetAllSponsorNameDescpNoOfEsponsred
);

// GET DRAFT ADS
router.get(
  "/:sponsorId/ads",
  // Made public for all users to view sponsor ads
  GetAllAdsBySpID
);

router.get(
  "/:sponsorId", // Made public for all users to view sponsor details
  GetSponsorByID
);

// @route   GET api/sponsors/ads/:adId
// @desc    Get a single ad by its ID (public)
router.get("/ads/:adId", GetAdByID);

// @route   PATCH api/sponsors/ads/:adId/view
// @desc    Increment the view count of an ad (public)
router.patch("/ads/:adId/view", incrementAdViewCount);

// @route   PATCH api/sponsors/ads/:adId/like
// @desc    Toggle like on an ad (requires auth)
router.patch("/ads/:adId/like", authentication, toggleAdLike);

export default router;
