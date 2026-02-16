import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { emailAlreadyExistsTxt, validateSignUpResBody, somethingWentWrongTxt, validateVerifyOtpParams, validateLoginResBody } from "./index.js"
import { AppError, consoleError, emailOtpSubject, getStandardErrorMessage, handleError, handleSendResponse, } from "../utils/index.js"
import { User, RefreshToken} from "../model/index.js"
import { env, privateKey } from '../config/index.js'
import { getNewUserEmailTemplate, sendEmail, storeOTP, verifyOTP } from '../services/index.js'

// handleLogin
export const handleLogin = async (req, res) => {
    try {

        const reqBody = validateLoginResBody(req)

        const {email, password} = reqBody;

        // Check user existence
        const user = await User.findOne({email})
        if(!user) throw new AppError("User not found", 401)

        // Verify password
        const isPassValid = await user.isPasswordValid(password, user.password)
        if(!isPassValid) throw new AppError("Invalid password", 401)

        const id = user?._id.toString()

        // Payload to put inside jwt token
        const payload = {
            sub: id,
            email:user.email
        }

        // Access Token
        const accessToken = jwt.sign(payload, privateKey, {
            algorithm:'RS256',
            expiresIn:'15m',
            issuer:env.ISSUER,
            audience:env.AUDIENCE,
        })

        // Refresh Token
        const refreshToken = jwt.sign({sub:id}, privateKey, {
            algorithm:'RS256',
            expiresIn:"7d",
            issuer:env.ISSUER
        })

        const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')

        // Save refresh token in DB
        const newRefreshToken = new RefreshToken({
            userId:id,
            token:hashedRefreshToken,
            expiresAt:new Date(Date.now() + 7*24*60*60*1000)
        })
        await newRefreshToken.save()

        res.cookie('accessToken', accessToken, {
            httpOnly:true,
            secure:env.COOKIE_SECURE==="true",
            sameSite:"Strict",
            maxAge:15*60*1000  // 15 Min Expiry
        }).cookie('refreshToken', refreshToken, {
            httpOnly:true,
            secure:env.COOKIE_SECURE==="true",
            sameSite:"Strict",
            maxAge:7*24*60*60*1000  // 7 Days Expiry
        })

        const userData = {
            userId:id,
            email:user.email
        }
        
        handleSendResponse(res, 200,true, "Logged in successfully",userData)
    } catch (error) {
        consoleError(error)
        const statusCode = error.statusCode || 500
        handleError(res, statusCode, error.message)
    }
}

// handleSendOTP
export const handleSendOTP = async (req, res) => {
    try {
        const reqBody = validateSignUpResBody(req)
        const { email,password } = reqBody;
        
        // Check user already exists or not
        const existingUser = await User.findOne({email})
        if(existingUser){
            return handleError(res,409,emailAlreadyExistsTxt)
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, Number(env.SALT_ROUND))
        
        // store OTP
        const payload = {...reqBody, password:hashedPassword}
        const otp = await storeOTP(email, payload)  // store otp in redis
    
        if(!otp) {
            consoleError({message:"OTP not found"})
            throw new AppError(somethingWentWrongTxt, 400)
        }

        const emailBody = `<p>Your email verification OTP is</p>
            <h2>${otp}</h2>
            <p>This OTP will expire in ${Number(env.OTP_TTL)/60} minutes.</p>
            <p>If you didn't request this, please contact your admin.</p>
        `

        // send OTP on mail
        await sendEmail(email, emailBody, emailOtpSubject)
            
        handleSendResponse(res, 200,true, "OTP sent successfully", otp) // send success response

    } catch (error) {
        consoleError(error)  // Log error

        // Check Duplicacy
        if(error && error?.code===11000){
            return handleError(res,409,emailAlreadyExistsTxt)
        }
        const statusCode = error?.statusCode || 500
        handleError(res, statusCode, getStandardErrorMessage(error))  // send error response
    }
}


// handleVerifyOTP
export const handleVerifyOTP = async (req,res) =>{
    try {
        const params = validateVerifyOtpParams(req)
        const {email, otp} = params

        const data = await verifyOTP(email, otp)

        if(data.valid){
            // Create newUser
            const newUser = new User({...data?.payload, isEmailVerified:true})
            const savedUser = await newUser.save()
            const {fullName, email} = savedUser;
            const response = {fullName, email}

            const emailbody = getNewUserEmailTemplate(fullName,email)

            // Send User Created Successfull email
            await sendEmail(email, emailbody, "Account Created Successfully")

            handleSendResponse(res,201,true,"OTP Verfied Succesfully. Account is created", response)
        }else{
            handleSendResponse(res,200,false,data.reason)
        }
        
    } catch (error) {
        consoleError(error)
        const statusCode = error?.statusCode || 500
        handleError(res,statusCode,somethingWentWrongTxt)
    }
}



// Handle RefreshToken
export const handleRefreshToken = async (req,res) =>{
    try {
        console.log("refredefedasfdsfsdfsf")
    } catch (error) {
        
    }
}


// HandleLogout
export const handleLogout = async (req,res) =>{
    try {
        const refToken = req.cookies.refreshToken
        if(refToken){
            const decode = jwt.decode(refToken)
            await RefreshToken.deleteOne({userId:decode.sub})
        }

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")

        handleSendResponse(res,200, true, "Logged out successfully")
        
    } catch (error) {
        consoleError(error)
            handleError(res,500, "Logout failed")
    }
}

