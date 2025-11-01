import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  description: String,
  leader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["co-organizer", "volunteer"] , default: "volunteer" },
    },
  ],
}, { timestamps: true });

const Team = mongoose.model("Team", teamSchema);
export default Team;


