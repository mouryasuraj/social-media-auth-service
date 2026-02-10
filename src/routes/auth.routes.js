import express from 'express'
import { handleLogin, handleSendOTP, handleVerifyOTP } from '../controller/index.js';

export const authRouter = express.Router()

authRouter.post("/login",handleLogin)
authRouter.post("/sendotp",handleSendOTP)
authRouter.post("/verifyotp",handleVerifyOTP)
