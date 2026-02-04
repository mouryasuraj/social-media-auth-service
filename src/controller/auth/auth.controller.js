import { consoleError, handleError, handleSendResponse } from "../../utils/index.js"
import { validateSignUpResBody } from "../index.js"

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
        validateSignUpResBody(req)
        handleSendResponse(res,201,"User Created Successfully",[{name:"Suraj Mourya"}])
    } catch (error) {
        consoleError(error)
        const statusCode = error?.statusCode || 500
        handleError(res, statusCode, error.message)
    }
}