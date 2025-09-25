import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    leader: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { 
          type: String, 
          enum: ["co-organizer", "volunteer", "editor"], 
          default: "volunteer" 
        }
      }
    ]
  },
  { timestamps: true } // auto-adds createdAt & updatedAt
);

const Team = mongoose.model("Team", TeamSchema);
export default Team;
