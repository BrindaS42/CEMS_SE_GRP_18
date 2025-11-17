import express from "express";
import {
    createSponsorAd,
    getSponsorDraftAds,
    getSponsorPublishedAds,
    publishSponsorAd,
    draftSponsorAd,
    deleteSponsorAd
} from "../../controllers/sponsor_controllers/sponsor_ads.controller.js";

import auth from "../../middleware/auth.middleware.js";
const { authentication, authorizeRoles } = auth;

const router = express.Router();

// CREATE AD (Draft by default)
router.post(
    "/create",
    authentication,
    authorizeRoles("sponsor"),
    createSponsorAd
);

// GET DRAFT ADS
router.get(
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
);

export default router;
