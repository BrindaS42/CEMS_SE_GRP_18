import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userObject = user.toObject();
    userObject.id = userObject._id;
    delete userObject._id;
    delete userObject.passwordHash;
    delete userObject.__v;

    return res.status(200).json(userObject || {});
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
    ); 

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clean the object for the frontend
    const userObject = updatedUser.toObject();
    userObject.id = userObject._id;
    delete userObject._id;
    delete userObject.passwordHash;
    delete userObject.__v;

    return res.status(200).json(userObject || {});
  } catch (error) {
    console.error("updateUserProfile error", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};

// --- Helper function to clean user objects for lists ---
const cleanUserForList = (user) => {
  const userObject = user.toObject();
  userObject.id = userObject._id;
  delete userObject._id;
  delete userObject.passwordHash;
  delete userObject.__v;
  return userObject;
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });
    const cleanedStudents = students.map(cleanUserForList);
    return res.status(200).json(cleanedStudents);
  } catch (error) {
    console.error("getAllStudents error", error);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: 'organizer' });
    const cleanedOrganizers = organizers.map(cleanUserForList);
    return res.status(200).json(cleanedOrganizers);
  } catch (error) {
    console.error("getAllOrganizers error", error);
    return res.status(500).json({ error: "Failed to fetch organizers" });
  }
};

export const getAllSponsors = async (req, res) => {
  try {
    const sponsors = await User.find({ role: 'sponsor' });
    const cleanedSponsors = sponsors.map(cleanUserForList);
    return res.status(200).json(cleanedSponsors);
  } catch (error) {
    console.error("getAllSponsors error", error);
    return res.status(500).json({ error: "Failed to fetch sponsors" });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' });
    // ✅ FIX: Use .map() to properly convert Mongoose docs to clean objects
    const cleanedAdmins = admins.map(cleanUserForList);
    return res.status(200).json(cleanedAdmins);
  } catch (error) {
    console.error("getAllAdmins error", error);
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
};