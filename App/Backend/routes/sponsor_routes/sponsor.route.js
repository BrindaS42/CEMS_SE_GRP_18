import express from "express";
import {
<<<<<<< HEAD
  GetAllSponsorNameDescpNoOfEsponsred,
    GetAllAdsBySpID,
    GetSponsorByID,
} from "../../controllers/sponsor_controllers/sponsor.controller.js";
=======
    createSponsorAd,
    getSponsorDraftAds,
    getSponsorPublishedAds,
    publishSponsorAd,
    draftSponsorAd,
    deleteSponsorAd
} from "../../controllers/sponsor_controllers/sponsor_ads.controller.js";

>>>>>>> feature/sponsor/admin
import auth from "../../middleware/auth.middleware.js";
const { authentication, authorizeRoles } = auth;

const router = express.Router();
<<<<<<< HEAD
router.get(
  "/list", // Made public for all users to view sponsors
  GetAllSponsorNameDescpNoOfEsponsred
=======

// CREATE AD (Draft by default)
router.post(
    "/create",
    authentication,
    authorizeRoles("sponsor"),
    createSponsorAd
>>>>>>> feature/sponsor/admin
);

// GET DRAFT ADS
router.get(
<<<<<<< HEAD
  "/:sponsorId/ads",
  // Made public for all users to view sponsor ads
  GetAllAdsBySpID
=======
    "/drafts",
    authentication,
    authorizeRoles("sponsor", "organizer", "admin"),
    getSponsorDraftAds
);

// GET PUBLISHED ADS
router.get(
    "/published",
    authentication,
    authorizeRoles("sponsor", "organizer", "admin"),
    getSponsorPublishedAds
);

// PUBLISH AD
router.patch(
    "/:adId/publish",
    authentication,
    authorizeRoles("sponsor"),
    publishSponsorAd
);

// MOVE TO DRAFT
router.patch(
    "/:adId/draft",
    authentication,
    authorizeRoles("sponsor"),
    draftSponsorAd
);

// DELETE AD
router.delete(
    "/:adId",
    authentication,
    authorizeRoles("sponsor", "admin"),
    deleteSponsorAd
>>>>>>> feature/sponsor/admin
);

router.get(
  "/:sponsorId", // Made public for all users to view sponsor details
  GetSponsorByID
);

export default router;
