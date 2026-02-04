import { AppError } from "../../utils/index.js"
import { allowedSignUpFields } from "../index.js"

export const validateSignUpResBody = (req) => {
    if (!req?.body || Object.keys(req?.body || {}).length === 0) throw new AppError("Request body is not present", 400)
    
    const reqBody = req.body
    const reqBodyFields = Object.keys(reqBody)

    const extraFields = reqBodyFields.filter(f =>!allowedSignUpFields.includes(f))
    const missingFields = !allowedSignUpFields.every(f => reqBodyFields.includes(f))
    
    if(extraFields.length>0){
        const errorMsg = `fields are not allowed: [${extraFields.map(f => f).join(", ")}]`
        throw new AppError(errorMsg,400)
    }
    if(missingFields){
        const errorMsg = `Required fields are missing`
        throw new AppError(errorMsg,400)
    }


    



}