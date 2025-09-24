import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["student", "organizer", "sponsor", "admin"],
      required: true,
    },
    authProvider: {
      type: String,
      enum: ["jwt", "google", "github"],
      default: "jwt",
    },
    email: { type: String, required: false, unique: true },
    passwordHash: { type: String },
    profile: {
      name: { type: String, required: true },
      profilePic: { type: String },
      contactNo: { type: String },
      linkedin: { type: String },
      github: { type: String },
      address: { type: String },
      dob: { type: Date },
      areasOfInterest: [String],
      pastAchievements: [
        {
          title: String,
          description: String,
          proof: String,
        },
      ],
      resume: { type: String },
    },

    linkedRoles: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
