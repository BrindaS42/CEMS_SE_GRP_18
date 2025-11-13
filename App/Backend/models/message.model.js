import mongoose from "mongoose";

<<<<<<< HEAD
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
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["Draft", "Sent", "Approved", "Rejected", "Pending"], default: "Draft" },
  message: String,
  relatedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  relatedTeam: { type: mongoose.Schema.Types.ObjectId, refPath: "relatedTeamModel" },
  relatedTeamModel: { type: String, enum: ["OrganizerTeam", "StudentTeam"] },
  role: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("InboxEntity", InboxEntitySchema);
=======
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // direct msg
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // linked event if any
  subject: { type: String },
  message: { type: String, required: true },
  attachments: [String],
  type: {
    type: String,
    enum: ["general", "announcement", "invitation"],
    default: "general",
  },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const Message = mongoose.model("Message", MessageSchema);

export default Message;
>>>>>>> authentication
