import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["co-organizer", "volunteer", "editor"],
      default: "volunteer"
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    // Unique token for the secure accept/decline link
    token: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Invitation = mongoose.model("Invitation", InvitationSchema);
export default Invitation;
