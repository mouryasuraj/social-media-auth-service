import bcrypt from 'bcrypt'
import { emailAlreadyExistsTxt, validateSignUpResBody,userCreatedSuccessfullyTxt, somethingWentWrongTxt, validateVerifyOtpParams } from "./index.js"
import { consoleError, handleError, handleSendResponse } from "../utils/index.js"
import { User } from "../model/index.js"
import { env } from '../config/index.js'
import { getStandardErrorMessage } from '../utils/getStandardErrorMessage.js'
import { storeOTP, verifyOTP } from '../services/index.js'

// handleLogin
export const handleLogin = async (req, res) => {
    try {
        console.log("Calling login this function", req.body)
        handleSendResponse(res, 200, "Logged in successfully")
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
        const otp = await storeOTP(email, payload)
    
        if(!otp) {
            consoleError({message:"OTP not found"})
            throw new AppError(somethingWentWrongTxt, 400)
        }

        // Login to send OTP
            
        handleSendResponse(res, 200, "OTP sent successfully", otp) // send success response

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

        

        // const newUser = new User
        const newUser = new User(JSON.parse(data.payload))
        // const savedUser = await newUser.save()
        // const response = {
        //     email:savedUser.email,
        //     fullName:savedUser.fullName
        // }

        if(data.valid){
            handleSendResponse(res,201,"OTP Verfied Succesfully. Account is created", {})
        }else{
            handleSendResponse(res,200,data.reason)
        }
        
    } catch (error) {
        consoleError(error)
        const statusCode = error?.statusCode || 500
        handleError(res,statusCode,somethingWentWrongTxt)
    }
}

