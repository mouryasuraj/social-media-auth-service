import express from 'express'
import { handleLogin, handleSendOTP, handleVerifyOTP, handleLogout,handleRefreshToken } from '../controller/index.js';
import { authMiddleware, refreshTokenMiddleware } from '../middleware/index.js';

export const authRouter = express.Router()

authRouter.post("/login",handleLogin)
authRouter.post("/sendotp",handleSendOTP)
authRouter.post("/verifyotp",handleVerifyOTP)
authRouter.get("/logout",handleLogout)
authRouter.get("/refreshtoken",refreshTokenMiddleware,handleRefreshToken)
