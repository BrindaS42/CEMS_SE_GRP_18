import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpires: {
      type: Date,
    },
    passwordForgotToken: {
      type: String,
    },
    passwordForgotTokenExpires: {
      type: Date,
    },

    passwordResetTokenExpires: {
      type: Date,
    },
    passwordForgotToken: {
      type: String,
    },
    passwordForgotTokenExpires: {
      type: Date,
    },
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
    email: {
      type: String,
      required: true,
      unique: false
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      required: function () {
        return this.role === 'student' || this.role === 'organizer';
      }
    },
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

    roleTag: { type: String },

    resumeUrl: { type: String },

    sponsorDetails: {
      firmDescription: String,
      firmLogo: String,
      links: [String],
      poc: {
        name: String,
        contactNo: String,
        email: String,
        role: String
      },
      banner : String,
      locations :
      [{
        address: String,
        title: String,
        description: String,
        mapLink: String,
      }]

    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
