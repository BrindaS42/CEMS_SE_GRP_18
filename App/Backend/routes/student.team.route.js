import { Router } from 'express'
import auth from '../middleware/auth.middleware.js'
import {
  createStudentTeam,
  deleteStudentTeam,
  getStudentTeams,
  sendInvitationToJoinTeam,
  showAllStudentTeam,
} from '../controllers/student.team.controller.js'

const { authentication, authorizeRoles } = auth;
const router = Router()

router.use(authentication, authorizeRoles('student'))

router.post('/', createStudentTeam)
router.get('/all', showAllStudentTeam)
router.get('/my-teams', getStudentTeams)
router.delete('/:teamId', deleteStudentTeam)
router.post('/:teamId/request-join', sendInvitationToJoinTeam)

export default router