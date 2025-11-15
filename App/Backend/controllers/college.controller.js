// In controllers/college.controller.js (NEW FILE)

import College from '../models/college.model.js';
import { model } from 'mongoose';

// @desc    Apply for a new college registration
// @route   POST /api/colleges/apply
// @access  Private (Any authenticated user, e.g., Organizer)

export const applyForCollegeRegistration = async (req, res) => {
    try {
        // 1. Get all fields from the form body
        const { name, code, logo, poc, address, website, description, tags } = req.body;
        const applicantId = req.user._id; // The user who is applying

        // 2. Basic Validation (Mongoose will handle the rest)
        if (!name || !code || !poc || !poc.contactEmail) {
            return res.status(400).json({ message: "College name, code, and POC contact email are required." });
        }

        // 3. Create new College document
        // The 'status' will automatically default to "Pending"
        const newCollege = new College({
            name,
            code,
            logo: logo || "",
            poc,
            address,
            website,
            description,
            tags
            // 'status' defaults to "Pending"
            // 'approvedBy' remains null for now
        });

        // 4. Save to database
        const savedCollege = await newCollege.save();

        // 5. (Future Step): Send an Inbox notification to all Admins
        // We'll skip this for now unless you want to add it.
        
        res.status(201).json({
            message: "College registration application submitted successfully. It is pending approval.",
            college: savedCollege
        });

    } catch (error) {
        // 6. Handle Unique Errors (if name or code already exists)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({ 
                message: `Conflict: A college with this ${field} already exists.`,
                field: field
            });
        }
        
        console.error("Error applying for college registration:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation failed", error: error.message });
        }
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};
