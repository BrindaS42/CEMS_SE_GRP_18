import mongoose from "mongoose";

const StudentTeamSchema = new mongoose.Schema(
  {
    teamName: { type: String, unique: true, required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [
      {
        member: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["Approved", "Pending", "Rejected"], default: "Pending" },
      },
    ],
  },
  { timestamps: true }
);

const StudentTeam = mongoose.model("StudentTeam", StudentTeamSchema);
export default StudentTeam;
