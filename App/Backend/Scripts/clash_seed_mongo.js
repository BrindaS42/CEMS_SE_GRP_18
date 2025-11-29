import mongoose from 'mongoose';
import dotenv from 'dotenv';
import College from './models/college.model.js';
import User from './models/user.model.js';
import Team from './models/organizerTeam.model.js';
import Event from './models/event.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017/cems_db';

const seedClashingEvents = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 MongoDB Connected for Clash Testing...');

        // 1. Helpers to generate specific dates
        const now = new Date();
        
        // Date A: 3 Days from now (Near Future)
        const dateNear = new Date(now);
        dateNear.setDate(now.getDate() + 3); 

        // Date B: 25 Days from now (~3-4 Weeks)
        const dateFar = new Date(now);
        dateFar.setDate(now.getDate() + 25);

        // 2. Fetch Prerequisites (College & Organizer)
        const college = await College.findOne() || await College.create({
            name: "Test Institute", code: "TEST", address: { city: "Test City" }
        });

        let organizer = await User.findOne({ role: "organizer" });
        if (!organizer) {
            console.log("⚠️ No organizer found, creating generic organizer.");
            organizer = await User.create({
                email: "clash_tester@org.com",
                role: "organizer",
                college: college._id,
                profile: { name: "Clash Tester" }
            });
        }

        let team = await Team.findOne({ leader: organizer._id });
        if (!team) {
            team = await Team.create({
                name: "Logistics Team",
                leader: organizer._id,
                members: []
            });
        }

        // 3. Define The Scenarios
        const clashingEvents = [
            // --- SCENARIO 1: THE CLASH ZONE (3 Days from now) ---
            {
                title: "CLASH TEST: Morning Keynote",
                description: "Standard morning event.",
                date: dateNear,
                // Time: 10 AM to 12 PM
                duration: { from: "10:00", to: "12:00" }, 
                venue: "Auditorium A",
                categoryTags: ["Seminar"]
            },
            {
                title: "CLASH TEST: Workshop (Overlaps Keynote)",
                description: "Starts an hour after Keynote, causing a conflict for attendees.",
                date: dateNear,
                // Time: 11 AM to 1 PM (Clashes with 10-12)
                duration: { from: "11:00", to: "13:00" }, 
                venue: "Lab 101",
                categoryTags: ["Workshop"]
            },
            {
                title: "CLASH TEST: All Day Hackathon",
                description: "Runs the entire day, clashing with EVERYTHING.",
                date: dateNear,
                // Time: 9 AM to 5 PM (Clashes with both above)
                duration: { from: "09:00", to: "17:00" }, 
                venue: "Main Hall",
                categoryTags: ["Hackathon"]
            },
            
            // --- SCENARIO 2: THE MIDNIGHT EDGE CASE (Same Day) ---
            {
                title: "CLASH TEST: Midnight Marathon",
                description: "Testing strict 24h format boundaries.",
                date: dateNear,
                // Time: 00:00 to 06:00
                duration: { from: "00:00", to: "06:00" }, 
                venue: "Sports Ground",
                categoryTags: ["Sports"]
            },

            // --- SCENARIO 3: FUTURE EVENTS (3-4 Weeks out) ---
            {
                title: "FUTURE TEST: Monthly Coding League",
                description: "This should appear in 'Upcoming' but not 'This Week'.",
                date: dateFar,
                // Time: 14:00 to 18:00
                duration: { from: "14:00", to: "18:00" },
                venue: "Computer Center",
                categoryTags: ["Coding"]
            },
            {
                title: "FUTURE TEST: End of Month Gala",
                description: "Late night event.",
                date: dateFar,
                // Time: 20:00 to 23:59
                duration: { from: "20:00", to: "23:59" },
                venue: "Open Air Theatre",
                categoryTags: ["Cultural"]
            }
        ];

        console.log('⚡ Generating Clashing & Future Events...');

        for (const evtData of clashingEvents) {
            // Avoid duplicates if script runs twice
            const exists = await Event.findOne({ title: evtData.title });
            if (exists) {
                console.log(`   ⏭️  Skipping existing: ${evtData.title}`);
                continue;
            }

            await Event.create({
                title: evtData.title,
                description: evtData.description,
                categoryTags: evtData.categoryTags,
                college: college._id,
                createdBy: team._id,
                venue: evtData.venue,
                location: { address: "Campus", coordinates: { lat: 0, lng: 0 } },
                timeline: [{
                    title: "Main Session",
                    description: "Primary timeline",
                    date: evtData.date,
                    duration: evtData.duration, // <--- The crucial part
                    venue: evtData.venue,
                    checkInRequired: false
                }],
                config: { isFree: true, registrationType: "Individual" },
                status: "published"
            });
            console.log(`   ✅ Created: ${evtData.title} | ${evtData.duration.from}-${evtData.duration.to}`);
        }

        console.log("\n=========================================");
        console.log("✅ CLASH & TIMELINE SEEDING COMPLETE");
        console.log("=========================================");
        console.log(`📅 Near Date Used: ${dateNear.toDateString()}`);
        console.log(`📅 Far Date Used:  ${dateFar.toDateString()}`);
        console.log("-----------------------------------------");
        console.log("👉 Check your Scheduler/Timeline view.");
        console.log("👉 You should see 3 overlapping events on the 'Near Date'.");
        console.log("👉 You should see 2 distinct events on the 'Far Date'.");
        console.log("=========================================");

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        mongoose.disconnect();
    }
};

seedClashingEvents();