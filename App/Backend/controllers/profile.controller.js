import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
   try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select("profile");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json(user.profile || {});
  } catch (error) {
    console.error("getUserProfile error", error);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const incomingProfile = req.body || {};

    // Replace entire profile subdocument with incoming fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profile: incomingProfile } },
      { new: true, runValidators: true }
    ).select("profile");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser.profile || {});
  } catch (error) {
    console.error("updateUserProfile error", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};
