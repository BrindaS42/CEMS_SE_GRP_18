import mongoose from "mongoose"; 

const RegistrationSchema = new mongoose.Schema({
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentTeamId: { type: mongoose.Schema.Types.ObjectId, ref: "StudentTeam" },

    registrationType: { type: String, enum: ["Individual", "Team"], required: true },
    paymentStatus: { type: String, enum: ["Unpaid", "Paid", "Pending Approval"], default: "Unpaid" },
    paymentScreenshotUrl: String,
    registrationData: mongoose.Schema.Types.Mixed,

    checkIns: [
        {
            timelineId: { type: mongoose.Schema.Types.ObjectId },
            checkInTime: { type: Date, default: Date.now },
            status: { type: String, enum: ["absent", "present"], default: "absent" },
        },
    ],

    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
}, { timestamps: true });

module.exports = mongoose.model("Registration", RegistrationSchema);