import bcrypt from 'bcrypt'
import { emailAlreadyExistsTxt, validateSignUpResBody, somethingWentWrongTxt, validateVerifyOtpParams } from "./index.js"
import { consoleError, emailOtpSubject, getStandardErrorMessage, handleError, handleSendResponse, } from "../utils/index.js"
import { User } from "../model/index.js"
import { env } from '../config/index.js'
import { getNewUserEmailTemplate, sendEmail, storeOTP, verifyOTP } from '../services/index.js'

// handleLogin
export const handleLogin = async (req, res) => {
    try {
        console.log("Calling login this function", req.body)
        handleSendResponse(res, 200,true, "Logged in successfully")
    } catch (error) {
        consoleError(error)
        handleError(res, 401, error.message)
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

