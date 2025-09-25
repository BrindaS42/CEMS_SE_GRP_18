// Backend/scripts/seed_dummy_event.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "../models/event.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL;

async function main() {
  await mongoose.connect(MONGO_URI);

  const doc = {
    _id: new mongoose.Types.ObjectId("66f3c1e2a4b8f2c9d0e1f234"),
    title: "Test Event",
    description: "Temporary event for testing map location controller",
    categoryTags: [],
    ruleBook: "",
    poc: { name: "", contact: "" },
    venue: "",
    location: {
      address: "",
      coordinates: {}, // empty on purpose
      mapAnnotations: []
    },
    timeline: [],
    subEvents: [],
    gallery: [],
    registrations: [],
    sponsors: [],
    announcements: [],
    winners: [],
    scoreboard: [],
    status: "draft",
    createdAt: new Date("2025-09-25T00:00:00.000Z"),
    updatedAt: new Date("2025-09-25T00:00:00.000Z")
  };

  const inserted = await Event.create(doc);
  console.log("Inserted event:", inserted._id.toString());
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});