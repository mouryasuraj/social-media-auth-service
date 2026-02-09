import bcrypt from 'bcrypt'
import { validateSignUpResBody } from "./index.js"
import { consoleError, handleError, handleSendResponse } from "../utils/index.js"
import { User } from "../model/index.js"
import { env } from '../config/index.js'

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
export const handleSignUp = async (req, res) => {
    try {
        const reqBody = validateSignUpResBody(req)
        const { password } = reqBody;
        // Hash password
        const hashedPassword = await bcrypt.hash(password, Number(env.SALT_ROUND))
        
        // save user to DB
        const user = new User({...reqBody, password:hashedPassword})
        const savedUser = await user.save()

        const responseData = {
            _id:savedUser._id,
            fullName:savedUser.fullName
        }

        handleSendResponse(res, 201, "User Created Successfully", responseData)
    } catch (error) {
        consoleError(error)
        const statusCode = error?.statusCode || 500
        handleError(res, statusCode, error.message)
    }
}