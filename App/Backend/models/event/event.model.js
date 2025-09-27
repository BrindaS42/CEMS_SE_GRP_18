import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    categoryTags: [{ type: String }],
    ruleBook: { type: String }, // URL

    poc: {
      name: { type: String },
      contact: { type: String }, // phone/email/etc.
    },

    venue: {
      address: { type: String }, // textual address
      coordinates: {
        lat: { type: Number }, // latitude
        lng: { type: Number }, // longitude
      },
      mapAnnotations: [
        {
          label: { type: String, required: true }, // e.g., "Main Gate"
          description: { type: String },
          coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
          },
          icon: { type: String },
          color: { type: String },
        },
      ],
    },

    timeline: [
      {
        date: { type: Date },
        time: { type: String },
        message: { type: String },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    subEvents: [
      {
        title: { type: String },
        description: { type: String },
      },
    ],

    gallery: [{ type: String }], // image URLs
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Registration" }],
    sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    announcements: [
      {
        title: { type: String },
        message: { type: String },
        date: { type: Date },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],

    winners: [
      {
        name: { type: String },
        team: [{ type: String }],
        proof: { type: String }, // URL/image/file
      },
    ],

    scoreboard: [
      {
        participant: { type: String },
        score: { type: Number },
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);

const Event = mongoose.model("Event", EventSchema);
export default Event;