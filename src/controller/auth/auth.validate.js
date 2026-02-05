import { AppError } from "../../utils/index.js"
import { allowedSignUpFields } from "../index.js"
import validator from 'validator'

export const validateSignUpResBody = (req) => {
    if (!req?.body || Object.keys(req?.body || {}).length === 0) throw new AppError("Request body is not present", 400)

    const reqBody = req.body
    const reqBodyFields = Object.keys(reqBody)

    const extraFields = reqBodyFields.filter(f => !allowedSignUpFields.includes(f))
    const missingFields = !allowedSignUpFields.every(f => reqBodyFields.includes(f))

    if (extraFields.length > 0) {
        const errorMsg = `fields are not allowed: [${extraFields.map(f => f).join(", ")}]`
        throw new AppError(errorMsg, 400)
    }
    if (missingFields) {
        const errorMsg = `Required fields are missing`
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