import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    categoryTags: [String],
    college : { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true },
    ruleBook: { type: String }, 
    posterUrl: { type: String },
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
            title: { type: String, required: true },
            description: { type: String, required: true },
            date: { type: Date, required: true },
            duration: { from: { type: String, required: true }, to: { type: String, required: true } },
            venue: { type: String, required: true },
            checkInRequired: { type: Boolean, default: false },
          },
      
    ],
    subEvents:
 [{ subevent:{type : mongoose.Schema.Types.ObjectId, ref: "Event"} ,
status : { type: String, enum: ["Pending", "Approved", "Reject", "suspended"], default: "Pending" }}],
    gallery: [{ type: String }], // image URLs
    config: {
        fees: { type: Number, default: 0 },
        qrCodeUrl: String,
        registrationType: { type: String, enum: ["Individual", "Team"], required: true },
        teamSizeRange: { min: Number, max: Number },
        registrationFields: [
          {
            title: String,
            description: String,
            inputType: { type: String, enum: ["text", "number", "date", "time", "checklist", "options"] },
            required: { type: Boolean, default: false },
            options: [String],
          },
        ],
      },
    
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Registration" }],
    sponsors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    announcements: [
        {
          date: Date,
          time: String,
          author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          message: String,
        },
      ],
    
    ratings: [
        {
          by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          rating: Number,
          review: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
    
    chatRoom: [
        {
          sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          message: String,
          createdAt: { type: Date, default: Date.now },
        },
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