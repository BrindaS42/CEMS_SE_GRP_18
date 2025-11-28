// In routes/college.route.js (NEW FILE)

import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js'; 
import { applyForCollegeRegistration, getAllApprovedColleges } from '../controllers/college.controller.js';

const router = express.Router();


router.route('/apply')
    .post(applyForCollegeRegistration);

router.get('/list/approved', getAllApprovedColleges);

export default router;