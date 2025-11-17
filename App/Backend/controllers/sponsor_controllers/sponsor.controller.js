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