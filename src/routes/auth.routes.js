import express from 'express'
import { handleLogin, handleSendOTP, handleVerifyOTP, handleLogout,handleRefreshToken, handleVerifyToken, handelGoogleLogin, handelGoogleSignup } from '../controller/index.js';
import { authMiddleware, refreshTokenMiddleware } from '../middleware/index.js';

export const authRouter = express.Router()

authRouter.post("/login",handleLogin)
authRouter.post("/googlelogin",handelGoogleLogin)
authRouter.post("/googlesignup",handelGoogleSignup)
authRouter.post("/sendotp",handleSendOTP)
authRouter.post("/verifyotp",handleVerifyOTP)
authRouter.get("/logout",handleLogout)
authRouter.get("/refreshtoken",refreshTokenMiddleware,handleRefreshToken)
authRouter.get("/verifytoken",authMiddleware,handleVerifyToken)
authRouter.get("/user",authMiddleware,(req,res)=>{
    res.json({message:"Succesfully"})
})
