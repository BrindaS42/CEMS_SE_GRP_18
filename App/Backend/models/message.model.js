import mongoose from "mongoose";

const InboxEntitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "announcement",
      "team_invite",
      "sponsorship_req",
      "mou_req",
      "registration_approval",
      "message"
    ],
    required: true,
  },
  title: String,
  description: String,
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  to: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  status: { type: String, enum: ["Draft", "Sent", "Approved", "Rejected", "Pending"], default: "Draft" },
  message: String,
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  relatedTeam: { type: mongoose.Schema.Types.ObjectId, refPath: "relatedTeamModel" },
  relatedTeamModel: { type: String, enum: ["Team", "StudentTeam"] },
  role: { type: String },
}, { timestamps: true });

const InboxEntity = mongoose.model("InboxEntity", InboxEntitySchema);
export default InboxEntity;