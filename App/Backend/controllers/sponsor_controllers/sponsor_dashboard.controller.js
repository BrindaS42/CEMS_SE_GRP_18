import SponsorAd from "../../models/sponsorad.model.js";

// -------------------------------
// GET DRAFT ADS
// -------------------------------
export const getDraftedAds = async (req, res) => {
    try {
        const sponsorId = req.user._id;

        const ads = await SponsorAd.find({
            sponsorId,
            status: "Drafted"
        });

        res.json({
            success: true,
            count: ads.length,
            ads
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// -------------------------------
// GET PUBLISHED ADS
// -------------------------------
export const getPublishedAds = async (req, res) => {
    try {
        const sponsorId = req.user._id;

        const ads = await SponsorAd.find({
            sponsorId,
            status: "Published"
        });

        res.json({
            success: true,
            count: ads.length,
            ads
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// -------------------------------
// GET TOTAL VIEWS OF ALL PUBLISHED ADS
// -------------------------------
export const getPublishedAdsViews = async (req, res) => {
    try {
        const sponsorId = req.user._id;

        const ads = await SponsorAd.find({
            sponsorId,
            status: "Published"
        }).select("views title");

        const totalViews = ads.reduce((sum, ad) => sum + ad.views, 0);

        res.json({
            success: true,
            totalViews,
            ads
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// -------------------------------
// GET TOTAL LIKES OF ALL PUBLISHED ADS
// -------------------------------
export const getPublishedAdsLikes = async (req, res) => {
    try {
        const sponsorId = req.user._id;

        const ads = await SponsorAd.find({
            sponsorId,
            status: "Published"
        }).select("likes title");

        const totalLikes = ads.reduce((sum, ad) => sum + ad.likes, 0);

        res.json({
            success: true,
            totalLikes,
            ads
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
