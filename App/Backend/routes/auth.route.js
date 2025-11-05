import express from 'express';
import { register, login , logout , requestPasswordReset, verifyOtpAndResetPassword} from '../controllers/auth.controller.js';import auth from '../middleware/auth.middleware.js'
const { authentication } = auth


const authRouter = express.Router();


authRouter.post('/register', register);
authRouter.post('/login', login);

authRouter.post('/logout',authentication, logout);

authRouter.post('/request-reset-password',authentication, requestPasswordReset);

authRouter.post('/verify-reset-password', authentication, verifyOtpAndResetPassword);

export default authRouter;