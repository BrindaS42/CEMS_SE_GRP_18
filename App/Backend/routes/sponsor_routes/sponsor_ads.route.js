import express from "express";
import {
    createSponsorAd,
    getSponsorAds,
    updateSponsorAd,
    deleteSponsorAd,
    publishSponsorAd
} from "../../controllers/sponsor_controllers/sponsorAd.controller.js";
import auth from "../../middleware/auth.middleware.js";

const { authentication, authorizeRoles } = auth;
const router = express.Router();

router.use(authentication, authorizeRoles("sponsor"));

router.post("/", createSponsorAd);
router.get("/", getSponsorAds);

router.put("/:id", updateSponsorAd);

router.delete("/:id", deleteSponsorAd);

router.patch("/:id/publish", publishSponsorAd);


export default router;

