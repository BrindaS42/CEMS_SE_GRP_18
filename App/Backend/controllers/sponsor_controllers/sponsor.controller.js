import User from "../../models/user.model.js";
import SponsorAd from "../../models/sponsorad.model.js";
import mongoose from "mongoose";

export const GetAllSponsorNameDescpNoOfEsponsred = async (req, res) => {
  try {
    // Find all users with the role 'sponsor'
    const sponsors = await User.find({ role: "sponsor" }).select(
      "-passwordHash -verificationToken -passwordResetToken"
    );
    res.status(200).json(sponsors);
  } catch (error) {
    console.error("Error fetching sponsor list:", error);
    res.status(500).json({
      error: "Failed to fetch sponsor list",
    });
  }
};

export const GetAllAdsBySpID = async (req, res) => {
  try {
    const { sponsorId } = req.params;

    const ads = await SponsorAd.find({ sponsorId });

    res.status(200).json(ads);
  } catch (error) {
    console.error("Error fetching sponsor ads:", error);
    res.status(500).json({ error: "Failed to fetch sponsor ads" });
  }
};

export const GetSponsorByID = async (req, res) => {
  try {
    const { sponsorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(sponsorId)) {
      return res.status(400).json({ error: "Invalid sponsor ID format" });
    }

    const sponsor = await User.findOne({
      _id: sponsorId,
      role: "sponsor",
    }).select("-passwordHash -verificationToken -passwordResetToken");

    if (!sponsor) {
      return res.status(404).json({ error: "Sponsor not found" });
    }

    res.status(200).json(sponsor);
  } catch (error) {
    console.error("Error fetching sponsor by ID:", error);
    res.status(500).json({ error: "Failed to fetch sponsor details" });
  }
};

export const GetAdByID = async (req, res) => {
  try {
    const { adId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: "Invalid ad ID format" });
    }

    const ad = await SponsorAd.findById(adId).populate({
      path: "sponsorId",
      select: "profile.name email sponsorDetails.firmLogo",
    });

    if (!ad || ad.status !== "Published") {
      return res.status(404).json({ error: "Advertisement not found or is not published" });
    }

    res.status(200).json(ad);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ad details" });
  }
};

export const incrementAdViewCount = async (req, res) => {
  try {
    const { adId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }
    // We don't wait for this to finish to speed up response time.
    // It's a "fire-and-forget" operation.
    SponsorAd.findByIdAndUpdate(adId, { $inc: { views: 1 } }).exec();
    res.sendStatus(200);
  } catch (error) {
    // Even if it fails, we don't want to block the user.
    // Log it for debugging but send a success response.
    console.error("Failed to increment view count:", error);
    res.sendStatus(200);
  }
};

export const toggleAdLike = async (req, res) => {
  try {
    const { adId } = req.params;
    const { liked } = req.body; // Expecting a boolean: true to like, false to unlike.

    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: "Invalid ad ID" });
    }

    const updatedAd = await SponsorAd.findByIdAndUpdate(
      adId,
      { $inc: { likes: liked ? 1 : -1 } },
      { new: true }
    ).select('likes');

    res.status(200).json({ likes: updatedAd.likes });
  } catch (error) {
    res.status(500).json({ error: "Failed to update like count" });
  }
};