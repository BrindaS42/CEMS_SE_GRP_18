// In routes/college.route.js (NEW FILE)

import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js'; 
import { applyForCollegeRegistration, getAllApprovedColleges } from '../controllers/college.controller.js';

const { authentication } = authMiddleware; // We only need authentication, not admin authorization
const router = express.Router();

// Route for applying for college registration
// Any authenticated user (student, organizer, etc.) can submit this POST request
router.route('/apply')
    .post(authentication, applyForCollegeRegistration);

// @route   GET api/colleges/list/approved
// @desc    Get all approved colleges (public route)
router.get('/list/approved', getAllApprovedColleges);

export default router;