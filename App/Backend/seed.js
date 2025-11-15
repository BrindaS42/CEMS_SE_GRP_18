// In App/Backend/seed.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Import your models using the exact filenames
import User from './models/user.model.js';
import College from './models/college.model.js'; // Assuming this is the filename

// --- Configuration ---
dotenv.config(); // Load .env variables (MONGODB_URL)

const connectDB = async () => {
  try {
    // Use the connection logic from your database.js
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected for Seeding...');
  } catch (err) {
    console.error('Seeder DB Connection Error:', err.message);
    process.exit(1);
  }
};

// --- Dummy Data ---

// Passwords must be hashed before insertion
const salt = await bcrypt.genSalt(10);
const adminPassword = await bcrypt.hash('admin123', salt);
const organizerPassword = await bcrypt.hash('organizer123', salt);
const studentPassword = await bcrypt.hash('student123', salt);

// 1. College Data
const collegesToSeed = [
  {
    name: "SGSITS Indore",
    code: "SGSITS",
    status: "Pending",
    poc: { pocName: "Prof. Verma", contactEmail: "verma@sgsits.ac.in" },
    address: { city: "Indore", state: "Madhya Pradesh" },
  },
  {
    name: "IIT Bombay",
    code: "IITB",
    status: "Approved", // Will be approved by our Admin user
    poc: { pocName: "Prof. Sharma", contactEmail: "sharma@iitb.ac.in" },
    address: { city: "Mumbai", state: "Maharashtra" },
  }
];

// 2. User Data (We will add college IDs dynamically)
const usersToSeed = [
  {
    role: "admin",
    authProvider: "jwt",
    email: "admin@cems.com",
    passwordHash: adminPassword,
    status: "active",
    profile: { name: "Admin User" },
  },
  {
    role: "organizer",
    authProvider: "jwt",
    email: "organizer@iitb.ac.in",
    passwordHash: organizerPassword,
    status: "active",
    profile: { name: "Alok Sharma (Organizer)" },
    college: null, // Will be replaced by IITB ObjectId
  },
  {
    role: "student",
    authProvider: "jwt",
    email: "student@sgsits.ac.in",
    passwordHash: studentPassword,
    status: "active",
    profile: { name: "Anisha Mittal (Student)" },
    college: null, // Will be replaced by SGSITS ObjectId
  }
];


// --- Seeding Function ---

const seedDatabase = async () => {
  try {
    await connectDB();

    // 1. Clear existing data
    console.log('Destroying old data...');
    await College.deleteMany({});
    await User.deleteMany({});

    // 2. Seed Admin User (so we can use its ID for 'approvedBy')
    const [adminUser] = await User.insertMany(usersToSeed.filter(u => u.role === 'admin'));
    console.log('Admin user created...');

    // 3. Update 'Approved' college with Admin's ObjectId
    collegesToSeed.find(c => c.status === 'Approved').approvedBy = adminUser._id;

    // 4. Seed Colleges
    const insertedColleges = await College.insertMany(collegesToSeed);
    console.log('Colleges created...');

    const sgsitsId = insertedColleges.find(c => c.code === 'SGSITS')._id;
    const iitbId = insertedColleges.find(c => c.code === 'IITB')._id;

    // 5. Update remaining users with correct College ObjectIds
    usersToSeed.find(u => u.email === 'student@sgsits.ac.in').college = sgsitsId;
    usersToSeed.find(u => u.email === 'organizer@iitb.ac.in').college = iitbId;

    // 6. Seed Students and Organizers
    await User.insertMany(usersToSeed.filter(u => u.role !== 'admin'));
    console.log('Students and Organizers created...');

    console.log('-------------------------');
    console.log('DATABASE SEEDING COMPLETE!');
    console.log('-------------------------');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

// --- Run the Seeder ---
seedDatabase();