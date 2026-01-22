import express, { application } from 'express'
import { handleLogin } from '../controller/auth-controller.js';

const authRouter = express.Router()

authRouter.get("/login",handleLogin)

export default authRouter;