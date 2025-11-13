import express from 'express';
import { 
    register,
    login, 
    logout,
    requestPasswordReset,
    verifyOtpAndResetPassword,
    generateOtpForAcc, 
    verifyOtpForAcc,
    requestForgotPassword,
    verifyForgotPassword
} from '../controllers/auth.controller.js';import auth from '../middleware/auth.middleware.js'
const { authentication } = auth

const authRouter = express.Router();

authRouter.post('/register', register);

authRouter.post('/login', login);

authRouter.post('/logout',authentication, logout);

authRouter.post('/password/request-reset', requestPasswordReset);
authRouter.post('/password/confirm-reset', verifyOtpAndResetPassword);

authRouter.post('/password/forgot/request', requestForgotPassword);
authRouter.post('/password/forgot/verify', verifyForgotPassword);

authRouter.post('/verification/account/request', authentication, generateOtpForAcc);
authRouter.post('/verification/account/verify', authentication, verifyOtpForAcc);

export default authRouter;