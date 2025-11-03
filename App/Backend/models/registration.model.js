import mongoose from "mongoose";

const checkInSchema = new mongoose.Schema({
  timelineId: { type: mongoose.Schema.Types.ObjectId, required: true },
  checkInTime: { type: Date },
  status: { type: String, enum: ["absent", "present"], default: "absent" },
});

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamName: { type: String },
    members: [{ type: String }],

    // Payment info
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "verified", "rejected", "not_required"],
      default: "unpaid",
    },
    paymentProof: { type: String },

    // Registration status
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    // Unique code for check-in
    checkInCode: {
      type: String,
      unique: true,
    },

    // Auto-generated from event timeline
    checkIns: [checkInSchema],

    // Stores answers to event registration form questions
    registrationData: mongoose.Schema.Types.Mixed,

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
