import express from 'express'
import { handleLogin, handleSignUp } from '../controller/index.js';

export const authRouter = express.Router()

authRouter.post("/login",handleLogin)
authRouter.post("/signup",handleSignUp)
