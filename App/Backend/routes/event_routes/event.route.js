import { Router } from 'express'
import auth from '../../middleware/auth.middleware.js'
import {
  getEventsForUser,
  getPublishedEvents,
  getDraftEvents,
  getRegistrationLogs,
  getCheckIns,
} from '../../controllers/organizer_controllers/organizer.dashboard.controller.js'

const { authentication, authorizeRoles } = auth
const router = Router()

// All routes require organizer or admin role
router.use(authentication, authorizeRoles('organizer', 'admin'))

router.get('/events', getEventsForUser)
router.get('/events/published', getPublishedEvents)
router.get('/events/drafts', getDraftEvents)
router.get('/events/:eventId/registrations', getRegistrationLogs)
router.get('/events/:eventId/checkins', getCheckIns)

export default router


