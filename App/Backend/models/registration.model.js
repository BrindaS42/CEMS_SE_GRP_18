import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
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

  teamName: { type: mongoose.Schema.Types.ObjectId, ref: "StudentTeam" },
  members: [{ type: String }],

  registrationData: [
    {
      question: { type: String, required: true },
      answer: { type: String, required: true },
    },
  ],

  paymentStatus: {
    type: String,
    enum: ["pending", "verified", "rejected", "not_required"],
    default: "not_required",
  },
  paymentProof: { type: String },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },

  checkInCode: {
    type: String,
    required: true,
    unique: true,
  },

  checkIns: [
    {
      timelineRef: { type: mongoose.Schema.Types.ObjectId, required: true },
      checkedInAt: { type: Date },
      status: { type: String, enum: ["absent", "present"], default: "absent" },
    },
  ],


  checkIn: {
    type: Boolean,
    default: false,
  },

  registeredAt: {
    type: Date,
    default: Date.now,
  },
});

const Registration = mongoose.model("Registration", registrationSchema);
export default Registration;
