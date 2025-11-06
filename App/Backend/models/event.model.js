import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    categoryTags: [String],
    ruleBook: { type: String }, // URL
    poc: { name: String, contact: String },
    venue: { type: String },
    location: {
        address: { type: String }, // textual address
        coordinates: {
            lat: { type: Number }, // latitude
            lng: { type: Number }  // longitude
        },
        mapAnnotations: [
            {
                label: { type: String, required: true },   
                description: { type: String },             
                coordinates: {
                    lat: { type: Number, required: true },
                    lng: { type: Number, required: true }
                },
                icon: { type: String },                    
                color: { type: String }                  
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
    status: { type: String, enum: ["draft", "published", "completed"], default: "draft" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
},{
    timestamps: true
});

const Event = mongoose.model("Event", EventSchema);
export default Event;