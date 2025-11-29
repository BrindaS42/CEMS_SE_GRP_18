import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import axios from 'axios';

// Import Models
import College from './models/college.model.js';
import User from './models/user.model.js';
import Team from './models/organizerTeam.model.js';
import Event from './models/event.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || 'mongodb://localhost:27017/cems_db';
const PYTHON_AI_SERVICE_URL = process.env.PYTHON_API_URL;


const seedRecommendationTest = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 MongoDB Connected for Test Seeding...');

        // ----------------------------------------------------------------
        // 1. PRE-REQUISITES (Get a valid College)
        // ----------------------------------------------------------------
        let college = await College.findOne();
        if (!college) {
            console.log('⚠️ No college found. Creating a dummy Test College.');
            college = await College.create({
                name: "Test Institute of Technology",
                code: "TEST-IT",
                address: { city: "Test City", state: "Test State" },
                status: "Approved"
            });
        }

        // ----------------------------------------------------------------
        // 2. CREATE TEST ORGANIZER (To own the events)
        // ----------------------------------------------------------------
        const passwordHash = await bcrypt.hash('password123', 10);
        
        let organizer = await User.findOne({ email: "test_org@recm.com" });
        if (!organizer) {
            console.log('👤 Creating Test Organizer...');
            organizer = await User.create({
                email: "test_org@recm.com",
                passwordHash,
                role: "organizer",
                isVerified: true,
                college: college._id,
                profile: { name: "Test Event Org", contactNo: "0000000000" }
            });
        }

        let orgTeam = await Team.findOne({ leader: organizer._id });
        if (!orgTeam) {
            orgTeam = await Team.create({
                name: "Recommendation Test Team",
                leader: organizer._id,
                members: []
            });
        }

        // ----------------------------------------------------------------
        // 3. CREATE 5 STRONGLY DIFFERENT EVENTS
        // ----------------------------------------------------------------
        console.log('🎉 Creating/Updating 5 Distinct Events for Recommendation...');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 5);

        // We define 5 specific categories to test against
        const testEvents = [
            {
                title: "RECM TEST: AI Innovation Summit",
                categoryTags: ["Technology", "AI/ML", "Coding"], 
                description: "A deep dive into neural networks and LLMs.",
                venue: "Tech Park"
            },
            {
                title: "RECM TEST: Nritya Cultural Night",
                categoryTags: ["Cultural", "Classical Dance", "Performance"],
                description: "A night of traditional dance performances.",
                venue: "Auditorium"
            },
            {
                title: "RECM TEST: Campus Sprint Marathon",
                categoryTags: ["Sports", "Athletics", "Fitness"],
                description: "5k run around the campus for fitness enthusiasts.",
                venue: "Sports Ground"
            },
            {
                title: "RECM TEST: Valorant Showdown",
                categoryTags: ["Gaming", "E-Sports", "PC Gaming"],
                description: "Inter-college 5v5 FPS tournament.",
                venue: "Computer Lab"
            },
            {
                title: "RECM TEST: Canvas & Colors Workshop",
                categoryTags: ["Art", "Painting", "Creativity"],
                description: "Hands-on oil painting workshop with experts.",
                venue: "Art Studio"
            }
        ];

        for (const evtData of testEvents) {
            let existingEvent = await Event.findOne({ title: evtData.title });
            const eventPayload = {
                title: evtData.title,
                description: evtData.description,
                categoryTags: evtData.categoryTags,
                college: college._id,
                createdBy: orgTeam._id,
                poc: { name: "Test Org", contact: "9999999999" },
                venue: evtData.venue,
                location: { address: "Test Location", coordinates: { lat: 23.0, lng: 72.0 }, mapAnnotations: [] },
                timeline: [{ title: "Main Event", description: "Main", date: tomorrow, duration: { from: "10:00", to: "18:00" }, venue: evtData.venue, checkInRequired: true }],
                config: { fees: 100, isFree: false, registrationType: "Individual", registrationFields: [] },
                status: "published"
            };

            if (!existingEvent) {
                const newEvent = await Event.create(eventPayload);
                console.log(`   ✅ Created Event: ${evtData.title}`);
                await axios.post(`${PYTHON_AI_SERVICE_URL}/recommend/add/${newEvent._id}`);
            } else {
                console.log(`   Event exists: ${evtData.title}`);
                existingEvent.categoryTags = evtData.categoryTags; // Ensure tags are synced
                await existingEvent.save();
            }
        }

        // ----------------------------------------------------------------
        // 4. CREATE MULTIPLE TEST USERS (Varied Profiles)
        // ----------------------------------------------------------------
        console.log('\n👥 Creating Test Users with Specific Profiles...');

        const userConfigs = [
            {
                // 1. FOCUSED TECH USER
                // Expectation: Should mostly see the "AI Innovation Summit"
                email: "recm_tech@test.com",
                name: "RECM Tech Focused",
                interests: ["AI/ML", "Technology", "Coding"],
                achievements: [{ title: "Hackathon Winner", description: "Won First prize in coding.", proof: "link" }]
            },
            {
                // 2. FOCUSED ART USER
                // Expectation: Should mostly see "Nritya Cultural Night" and "Canvas Workshop"
                email: "recm_art@test.com",
                name: "RECM Art Focused",
                interests: ["Classical Dance", "Painting", "Art"],
                achievements: [{ title: "State Dance Competition", description: "First Place.", proof: "link" }]
            },
            {
                // 3. STATIC SPORTS USER
                // Expectation: Should mostly see "Campus Sprint Marathon"
                email: "recm_sports@test.com",
                name: "RECM Sports Static",
                interests: ["Sports", "Athletics", "Fitness"],
                achievements: [{ title: "Marathon Runner", description: "Completed 21km run.", proof: "link" }]
            },
            {
                // 4. DIVERSIFIED EXPLORER
                // Expectation: Should see a mix of Tech, Gaming, and Art
                email: "recm_explorer@test.com",
                name: "RECM Diversified Explorer",
                interests: ["AI/ML", "E-Sports", "Painting", "Technology"], 
                achievements: [
                    { title: "Debate Winner", description: "Best Speaker.", proof: "link" },
                    { title: "Gaming Tournament", description: "MVP in Valorant.", proof: "link" }
                ]
            }
        ];

        for (const config of userConfigs) {
            let user = await User.findOne({ email: config.email });
            const profileData = {
                name: config.name,
                contactNo: "1234567890",
                areasOfInterest: config.interests,
                pastAchievements: config.achievements
            };

            if (!user) {
                user = await User.create({
                    email: config.email,
                    passwordHash,
                    role: "student",
                    isVerified: true,
                    college: college._id,
                    profile: profileData,
                    status: "active"
                });
                console.log(`   ✅ Created User: ${config.name} (${config.interests.join(', ')})`);
            } else {
                user.profile = profileData;
                await user.save();
                console.log(`   🔄 Updated User: ${config.name}`);
            }
            
            // Log ID for easy testing
            console.log(`      ID: ${user._id}`);
        }

        console.log("\n=========================================");
        console.log("✅ SEEDING COMPLETE");
        console.log("=========================================");
        console.log("👉 Use the User IDs printed above to test your recommendation API.");
        console.log("   - Tech User should get Tech events.");
        console.log("   - Art User should get Art/Culture events.");
        console.log("   - Sports User should get Sports events.");
        console.log("   - Explorer User should get a mix.");
        console.log("=========================================");

    } catch (error) {
        console.error("❌ Error seeding test data:", error);
    } finally {
        mongoose.disconnect();
    }
};

seedRecommendationTest();