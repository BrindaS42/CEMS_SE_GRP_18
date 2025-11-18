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

router.use(authentication, authorizeRoles("sponsor"));

router.get("/drafts", getDraftedAds);
router.get("/published", getPublishedAds);
router.get("/views", getPublishedAdsViews);
router.get("/likes", getPublishedAdsLikes);

export default router;

