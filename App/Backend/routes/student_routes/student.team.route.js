import { Router } from 'express'
import auth from '../../middleware/auth.middleware.js'
import {
  createStudentTeam,
  deleteStudentTeam,
  getStudentTeams,
  sendInvitationToJoinTeam,
  getAllStudents,
  showAllStudentTeam,
  updateStudentTeam
} from '../../controllers/student_controller/student.team.controller.js'

const { authentication, authorizeRoles } = auth;
const router = Router()

router.use(authentication, authorizeRoles('student'))

router.post('/create', createStudentTeam)
router.get('/all', showAllStudentTeam)
router.get('/all-students', getAllStudents) // New route to fetch all students
router.get('/my-teams', getStudentTeams)
router.delete('/:teamId', deleteStudentTeam)
router.post('/:teamId/request-join', sendInvitationToJoinTeam)
router.patch('/:teamId', updateStudentTeam)

export default router