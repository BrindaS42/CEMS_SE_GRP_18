import express from "express";
import {
    getDraftedAds,
    getPublishedAds,
    getPublishedAdsViews,
    getPublishedAdsLikes
} from "../../controllers/sponsor_controllers/sponsor_dashboard.controller.js";

import auth from "../../middleware/auth.middleware.js";
const { authentication, authorizeRoles } = auth;

const router = express.Router();

router.get(
    "/drafts",
    authentication,
    authorizeRoles("sponsor"),
    getDraftedAds
);

router.get(
    "/published",
    authentication,
    authorizeRoles("sponsor"),
    getPublishedAds
);

router.get(
    "/published/views",
    authentication,
    authorizeRoles("sponsor"),
    getPublishedAdsViews
);

router.get(
    "/published/likes",
    authentication,
    authorizeRoles("sponsor"),
    getPublishedAdsLikes
);

export default router;
