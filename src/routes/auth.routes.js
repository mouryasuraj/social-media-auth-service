import express from 'express'
import { handleLogin, handleSendOTP } from '../controller/index.js';

export const authRouter = express.Router()

authRouter.post("/login",handleLogin)
authRouter.post("/signup",handleSendOTP)
