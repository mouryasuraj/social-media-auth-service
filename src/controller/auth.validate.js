import { AppError, consoleError } from "../utils/index.js"
import { allowedSignUpFields, reqBodyNotPresentTxt, allowedLoginFields, unauthorizedAccessTxt } from "./index.js"
import validator from 'validator'

export const validateLoginResBody = (req) =>{
    // Validate Reqbody
    if(!req?.body || Object.keys(req?.body || {}).length===0) throw new AppError(reqBodyNotPresentTxt, 400)
    
    const reqBody = req.body
    const reqBodyFields = Object.keys(reqBody)

    // Validate Reqbody fields
    const extraFields = reqBodyFields.filter((d) => !allowedLoginFields.includes(d));
    const isMissingFields = !allowedLoginFields.every(d => reqBodyFields.includes(d))

    // Validate Extrafields
    if(extraFields.length!==0){
        consoleError({message:`fields are not allowed: [${extraFields.join(", ")}]`})
        throw new AppError(unauthorizedAccessTxt,401)
    } 
    // Validate Missing Fields
    if(isMissingFields){
        consoleError({message:`Required fields are missing: [${allowedLoginFields.join(", ")}]`})
        throw new AppError(unauthorizedAccessTxt,401)
    } 

    const {email, password} = reqBody
    const loginValidation = [
        {isValid:!email, message:"Please provide email"},
        {isValid:!validator.isEmail(email), message:"Please provide valid email"},
        {isValid:!password, message:"Please provide password"},
    ]

    for(const check of loginValidation){
        if(check.isValid){
            consoleError({message:check?.message})
            throw new AppError(unauthorizedAccessTxt, 401)
        }
    }


    return {email:email.trim(), password:password.trim()}

}


export const validateSignUpResBody = (req) => {
    if (!req?.body || Object.keys(req?.body || {}).length === 0) throw new AppError(reqBodyNotPresentTxt, 400)

    const reqBody = req.body
    const reqBodyFields = Object.keys(reqBody)

    const extraFields = reqBodyFields.filter(f => !allowedSignUpFields.includes(f))
    const isMissingFields = !allowedSignUpFields.every(f => reqBodyFields.includes(f))

    if (extraFields.length > 0) {
        const errorMsg = `fields are not allowed: [${extraFields.join(", ")}]`
        throw new AppError(errorMsg, 400)
    }
    if (isMissingFields) {
        const errorMsg = `Required fields are missing: ${allowedSignUpFields.join(", ")}`
        throw new AppError(errorMsg, 400)
    }

    const { fullName, email, password, age, skills, about, photoUrl } = reqBody;

    // Validate Req Body Fields
    const signupFieldValidation = [
        { isValid: !fullName.trim(), message: "Please provide fullName" },
        { isValid: fullName.trim().length > 30, message: "fullName should be less then 30 character" },
        { isValid: !email.trim(), message: "Please provide email" },
        { isValid: !validator.isEmail(email.trim()), message: "Please provide valid email" },
        { isValid: !password.trim(), message: "Please provide password" },
        { isValid: !validator.isStrongPassword(password.trim(), { minLength: 8, minLowercase: 1, minNumbers: 1, minSymbols: 1, minUppercase: 1 }), message: "Please provide strong password" },
        { isValid: !age, message: "Please provide age" },
        { isValid: Number(age) < 18 || Number(age) > 100, message: "Please provide valid age" },
        { isValid: skills && !Array.isArray(skills), message: "Please provide valid skills" },
        { isValid: about.trim() && about.trim().length > 100, message: "about should be less then 100 character" },
        { isValid: photoUrl.trim() && photoUrl.trim().length > 250, message: "photoUrl should be less then 250 character" },
        { isValid: photoUrl.trim() && !validator.isURL(photoUrl.trim(), { max_allowed_length: 250, protocols: ['https'] }), message: "Please provide valid photoUrl" },
    ]

    for (const check of signupFieldValidation) {
        if (check.isValid) {
            throw new AppError(check.message, 400)
        }
    }

    return reqBody
}


export const validateVerifyOtpParams = (req) =>{
    const params = req?.query
    if(!params || !params?.email || !params?.otp){
        throw new AppError("email or otp not found",400)
    }

    const {email} = params

    if(!validator.isEmail(email)) throw new AppError("invalid email", 400)

    return params
}