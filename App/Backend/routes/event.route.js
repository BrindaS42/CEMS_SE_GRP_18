import { Router } from 'express'
import auth from '../middleware/auth.middleware.js'
import {
  getEventsForUser,
  getPublishedEvents,
  getDraftEvents,
  getRegistrationLogs,
  getCheckIns,
} from '../controllers/event_controllers/dashboard.controller.js'

const { authentication, authorizeRoles } = auth
const router = Router()

// All routes require organizer or admin role
router.use(authentication, authorizeRoles('organizer', 'admin'))

router.get('/dashboard/events', getEventsForUser)
router.get('/dashboard/events/published', getPublishedEvents)
router.get('/dashboard/events/drafts', getDraftEvents)
router.get('/dashboard/events/:eventId/registrations', getRegistrationLogs)
router.get('/dashboard/events/:eventId/checkins', getCheckIns)

export default router


