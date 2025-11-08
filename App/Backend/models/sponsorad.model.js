const SponsorAdSchema = new mongoose.Schema({
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    images: [String],
    videos: [String],
    address: String,
    contact: String,
    poster: String,

    status: { type: String, enum: ["Drafted", "Published"], default: "Drafted" },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("SponsorAd", SponsorAdSchema);
