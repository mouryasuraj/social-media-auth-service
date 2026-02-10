import { AppError } from "../utils/index.js"

export const generateEmailStructure = (from, to, subject, html)=>{
    if(!from || !to || !html) throw new AppError("sender email or receiver email or email body is missing", 400)
    return {
        from,
        to,
        subject,
        html
    }
}