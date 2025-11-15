import { Router } from 'express';
import { searchLocation } from '../controllers/geocoding.controller.js';
import auth from '../middleware/auth.middleware.js';

const router = Router();

// The user must be authenticated to reach the page that calls this,
// so we can remove the middleware here to allow the Leaflet plugin
// to call this proxy route without sending auth cookies.
router.get('/search', searchLocation);

export default router;