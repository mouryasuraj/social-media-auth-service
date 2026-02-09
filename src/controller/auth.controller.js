import bcrypt from 'bcrypt'
import { emailAlreadyExistsTxt, validateSignUpResBody,userCreatedSuccessfullyTxt } from "./index.js"
import { consoleError, handleError, handleSendResponse } from "../utils/index.js"
import { User } from "../model/index.js"
import { env } from '../config/index.js'
import { getStandardErrorMessage } from '../utils/getStandardErrorMessage.js'
import { storeOTP } from '../services/index.js'

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

// handleSignUp
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
        const otp = storeOTP(email, payload)






        // const savedUser = await user.save()

        // Generate response
        // const responseData = {
        //     _id:savedUser._id,
        //     fullName:savedUser.fullName,
        //     email:savedUser.email,
        //     age:savedUser.age
        // }
        handleSendResponse(res, 201, userCreatedSuccessfullyTxt, otp) // send success response
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