import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    categoryTags: [String],
    ruleBook: { type: String }, // URL
    poc: { name: String, contact: String },
    venue: {
        address: { type: String }, // textual address
        coordinates: {
            lat: { type: Number }, // latitude
            lng: { type: Number }  // longitude
        },
        mapAnnotations: [
            {
                label: { type: String, required: true },   // e.g., "Main Gate", "Auditorium Entrance"
                description: { type: String },             // details about this point
                coordinates: {
                    lat: { type: Number, required: true },
                    lng: { type: Number, required: true }
                },
                icon: { type: String },                    // custom icon for marker (optional)
                color: { type: String }                    // to style the marker
            }
        ]
    },
    timeline: [
        {
            date: Date,
            time: String,
            message: String,
            addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }
    ],
    subEvents: [{ title: String, description: String }],
    gallery: [{ type: String }], // image URLs
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Registration" }],
    sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    announcements: [
        {
            title: String,
            message: String,
            date: Date,
            postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
        }
    ],
    winners: [{ name: String, team: [String], proof: String }],
    scoreboard: [
        { participant: String, score: Number }
    ],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Event = mongoose.model("Event", EventSchema);
export default Event;