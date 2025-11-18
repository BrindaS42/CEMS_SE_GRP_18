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

const { authentication, authorizeRoles, checkSuspension } = auth;
const router = Router()

router.use(authentication, authorizeRoles('student'))

router.post('/create',checkSuspension, createStudentTeam)
router.get('/all', showAllStudentTeam)
router.get('/all-students', getAllStudents) // New route to fetch all students
router.get('/my-teams', getStudentTeams)
router.delete('/:teamId', checkSuspension,deleteStudentTeam)
router.post('/:teamId/request-join', checkSuspension,sendInvitationToJoinTeam)
router.patch('/:teamId', checkSuspension, updateStudentTeam)

export default router