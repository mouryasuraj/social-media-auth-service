import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { env, privateKey } from '../config/index.js'
import { RefreshToken } from '../model/refreshtoken.model.js'

const generateToken = (payload, algorithm, expiresIn) =>{
    const token = jwt.sign(payload, privateKey, {
        algorithm,
        expiresIn,
        issuer: env.ISSUER,
        audience: env.AUDIENCE,
    })
    return token
}

const saveHashedToken = async (token, id) =>{
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    
    // Save refresh token in DB
    const newToken = new RefreshToken({
        userId: id,
        token: hashedToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    await newToken.save()
}


export const helper = {generateToken,saveHashedToken}