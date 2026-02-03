import { consoleError, handleError } from "../utils/index.js"

// handleLogin
export const handleLogin = async (req,res)=>{
    try {
        console.log("Calling login this function")
        res.json({status:true, message:"API called successfully"})
    } catch (error) {
        consoleError(error)
        handleError(res, 401, error.message)
    }
}

// handleSignUp
export const handleSignUp = async (req,res)=>{
    try {
        console.log("Signing.... in")
        res.status(201).json({message:"User created successfully",status:true})
    } catch (error) {
        consoleError(error)
        handleError(res, 500, error.message)
    }
}