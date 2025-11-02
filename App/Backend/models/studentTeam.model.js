import mongoose from "mongoose";

const StudentTeamSchema = new mongoose.Schema(
  {
    teamName: { type: String, unique: true, required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudentTeam", StudentTeamSchema);
