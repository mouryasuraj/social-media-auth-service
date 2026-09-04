import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { validateSignUpReqBody, validateVerifyOtpParams, validateLoginReqBody, validateGoogleFields } from "./index.js"
import { AppError, consoleError, emailOtpKey, getStandardErrorMessage, handleError, handleSendResponse,emailAlreadyExistsTxt,maxAttemp,somethingWentWrongTxt,unauthorizedAccessTxt, verifyGoogleCred, helper } from "../utils/index.js"
import { AuthUser, RefreshToken } from "../model/index.js"
import { env, privateKey, redis } from '../config/index.js'
import { storeOTP, verifyOTP } from '../services/index.js'
import { sendMailEvent } from '../messaging/producer/mail.producer.js'

// handleLogin
export const handleLogin = async (req, res) => {
    try {

        const reqBody = validateLoginReqBody(req)

        const { email, password } = reqBody;

        // Check user existence
        const user = await AuthUser.findOne({ email })
        if (!user) throw new AppError("User not found", 401)
        
        if(user?.authProvider==="google") throw new AppError("This email is registered with Google. Please try to Sign in with it.", 400)

        // Verify password
        const isPassValid = await user.isPasswordValid(password)
        if (!isPassValid) throw new AppError("Invalid password", 401)

        const id = user?._id.toString()

        // Payload to put inside jwt token
        const payload = {
            sub: id,
            email: user.email
        }

        // Tokens
        const accessToken = helper.generateToken(payload, "RS256", "15m")
        const refreshToken = helper.generateToken(payload, "RS256", "7d")

        await helper.saveHashedToken(refreshToken, id)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000  // 15 Min Expiry
        }).cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 Days Expiry
        })

        const userData = {
            userId: id,
            email: user.email,
            isEmailVerified: user.isEmailVerified
        }

        handleSendResponse(res, 200, true, "Logged in successfully", userData)
    } catch (error) {
        consoleError(error)
        const statusCode = error.statusCode || 500
        handleError(res, statusCode, error?.message)
    }
}

// handleSendOTP
export const handleSendOTP = async (req, res) => {
    try {
        const reqBody = validateSignUpReqBody(req)
        const { email, password } = reqBody;

        // Check user already exists or not
        const existingUser = await AuthUser.findOne({ email })
        if (existingUser) {
            return handleError(res, 409, emailAlreadyExistsTxt)
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, Number(env.SALT_ROUND))

        // store OTP
        const payload = { ...reqBody, password: hashedPassword }
        const otp = await storeOTP(email, payload)  // store otp in redis

        if (!otp) {
            consoleError({ message: "OTP not found" })
            throw new AppError(somethingWentWrongTxt, 400)
        }
        
        await sendMailEvent({email, otp, eventType:"SEND_OTP"})

        handleSendResponse(res, 200, true, "OTP sent successfully", otp) // send success response

    } catch (error) {
        consoleError(error)  // Log error

        // Check Duplicacy
        if (error && error?.code === 11000) {
            return handleError(res, 409, emailAlreadyExistsTxt)
        }
        const statusCode = error?.statusCode || 500
        handleError(res, statusCode, getStandardErrorMessage(error))  // send error response
    }
}


// handleVerifyOTP
export const handleVerifyOTP = async (req, res) => {
    try {
        const params = validateVerifyOtpParams(req)
        const { email, otp } = params

        const data = await verifyOTP(email, otp)

        if (data.valid) {
            // Create newUser
            const newUser = new AuthUser({ ...data?.payload, isEmailVerified: true, authProvider:"local" })
            const savedUser = await newUser.save()
            const { fullName, email } = savedUser;
            const response = { fullName, email }

            // Delete key from redis
            const key = `${emailOtpKey}:${email}`;
            await redis.del(key)

            await sendMailEvent({email,fullName, eventType:"NEW_USER_ACC"})

            handleSendResponse(res, 201, true, "OTP Verfied Succesfully. Account is created", response)
        } else {
            const status = data.reason === maxAttemp ? 403 : 200
            handleSendResponse(res, status, false, data.reason)
        }

    } catch (error) {
        consoleError(error)
        const statusCode = error?.statusCode || 500
        handleError(res, statusCode, somethingWentWrongTxt)
    }
}



// Handle RefreshToken
export const handleRefreshToken = async (req, res) => {
    try {
        const user = req.user
        if (!user) throw new AppError("User data not found", 401)

        const payload = {
            sub: user.sub,
            email: user.email
        }

        const newAccessToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: "15m",
            issuer: env.ISSUER,
            audience: env.AUDIENCE
        })

        const newRefreshToken = jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: "7d",
            issuer: env.ISSUER,
            audience: env.AUDIENCE
        })

        const hashedRefreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex")

        await RefreshToken.findByIdAndUpdate(req.storedToken._id, {
            token: hashedRefreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })

        console.log("stored old hash")

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000  // 15min
        }).cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 Days Expiry
        })

        handleSendResponse(res, 200, true, "Access token generated successfully")


    } catch (error) {
        consoleError(error)
        handleError(res, 401, unauthorizedAccessTxt)
    }
}


// HandleLogout
export const handleLogout = async (req, res) => {
    try {
        const refToken = req.cookies.refreshToken
        if (refToken) {
            const decode = jwt.decode(refToken)
            await RefreshToken.deleteOne({ userId: decode.sub })
        }

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        handleSendResponse(res, 200, true, "Logged out successfully")

    } catch (error) {
        consoleError(error)
        handleError(res, 500, "Logout failed")
    }
}



// handleVerifyToken
export const handleVerifyToken = async (req,res) => {
    try {
        const user = req.user
        handleSendResponse(res, 200, true, "Token verified successfully", user)
    } catch (error) {
        consoleError(error)
        handleError(res,401,unauthorizedAccessTxt)
    }
}



// handleGoogleLogin
export const handelGoogleLogin = async (req,res) =>{
    try {
        const reqBody = validateGoogleFields(req)
        const {credentials} = reqBody

        // verify credentials with google
        const {email,email_verified} = await verifyGoogleCred(credentials)
        
        const existingUser = await AuthUser.findOne({email})

        if(!existingUser) throw new AppError("Email is not registered with us. Please create an account", 500)

        if(existingUser && existingUser.authProvider === "local"){
            throw new AppError("This email requires password. Please login with email and password", 409)
        }

        const {_id} = existingUser

        const payload = {
            sub: _id,
            email
        }
        
        // Tokens
        const accessToken = helper.generateToken(payload, "RS256", "15m")
        const refreshToken = helper.generateToken(payload, "RS256", "7d")

        await helper.saveHashedToken(refreshToken, _id)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000  // 15 Min Expiry
        }).cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 Days Expiry
        })

        const userData = {
            userId: _id,
            email: email,
            isEmailVerified: email_verified
        }

        handleSendResponse(res, 200, true, "Logged in successfully", userData)
        
        
    } catch (error) {
        consoleError(error)
        const statusCode = error.statusCode || 500
        handleError(res, statusCode, error?.message)
    }
}

// handleGoogleSignup
export const handelGoogleSignup = async (req,res) =>{
    try {

        const reqBody = validateGoogleFields(req)
        const {credentials} = reqBody

        // verify credentials with google
        const {email,email_verified,sub } = await verifyGoogleCred(credentials)
        
        const existingUser = await AuthUser.findOne({email})
        if(existingUser && existingUser.authProvider === "local"){
            throw new AppError("Email already exist. Please login with email and password", 409)
        }
        if(existingUser && existingUser.authProvider === "google"){
            throw new AppError("Email already registered with us. Please Sign in with your google", 409)
        }

        const newUser = new AuthUser({
            isEmailVerified:email_verified,
            authProvider:"google",
            googleId:sub,
            password:null,
            email
        })
        const {_id} = await newUser.save()
        
        const payload = {
            sub: _id,
            email
        }
        
        // Tokens
        const accessToken = helper.generateToken(payload, "RS256", "15m")
        const refreshToken = helper.generateToken(payload, "RS256", "7d")

        await helper.saveHashedToken(refreshToken, _id)

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000  // 15 Min Expiry
        }).cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: env.COOKIE_SECURE === "true",
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 Days Expiry
        })

        const userData = {
            userId: _id,
            email: email,
            isEmailVerified: email_verified
        }

        handleSendResponse(res, 200, true, "Logged in successfully", userData)
        
    } catch (error) {
        consoleError(error)
        const statusCode = error.statusCode || 500
        handleError(res, statusCode, error.message || "invalid credentials")
    }
}