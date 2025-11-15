import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // No two colleges with same name
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true, // e.g., "NIT-SRT", "SVNIT", "IITB"
      uppercase: true,
    },
    logo: {
      type: String, // Cloudinary or CDN URL
      default: "",
    },
    poc:{
	   pocName: {type : String},
      contactEmail: {type : String},
    contactNumber: {type : String}
    },

        address :{
      Localaddress: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: "India" },
      pincode: { type: String },
    },
    website : {
      type: String,
    },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // System Admin who approved this college
    },
    
    // Optional tags or description
    description: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("College", CollegeSchema);
