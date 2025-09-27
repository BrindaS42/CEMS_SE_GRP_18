import mongoose from "mongoose";

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
