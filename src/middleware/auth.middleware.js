import crypto from 'crypto'
import { env, publicKey } from "../config/index.js"
import { unauthorizedAccessTxt } from "../controller/index.js"
import { RefreshToken } from "../model/index.js"
import { AppError, consoleError, handleError } from "../utils/index.js"
import jwt from 'jsonwebtoken'

export const authMiddleware = async (req,res,next) =>{
    try {

        const accessToken = req.cookies.accessToken
        if(!accessToken) throw new AppError("Access token not found", 401)

        const decoded = jwt.verify(accessToken, publicKey,{
            algorithms:'RS256',
            issuer:env.ISSUER,
            audience:env.AUDIENCE
        })
        if(!decoded) throw new AppError("User id not found in token",401)

        req.user = decoded
        next()
        
    } catch (error) {
        consoleError(error)
        handleError(res,401, unauthorizedAccessTxt)
    }
}


export const refreshTokenMiddleware = async (req,res,next) =>{
    try {

        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) throw new AppError("Refresh token not found", 401)

        

        const decoded = jwt.verify(refreshToken, publicKey, {
            algorithms:'RS256',
            issuer:env.ISSUER,
            audience:env.AUDIENCE
        })

        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')
        
        const storedToken = await RefreshToken.findOne({token:hashedRefreshToken, userId:decoded.sub})

        if(!storedToken) throw new AppError("Refresh token expired", 401)

        req.user = decoded
        next()
        
        
    } catch (error) {
        consoleError(error)
        handleError(res,401, unauthorizedAccessTxt)
    }
}