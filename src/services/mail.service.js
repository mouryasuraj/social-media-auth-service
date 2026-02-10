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



export const getNewUserEmailTemplate = (fullName, email) =>{
    return `
        <p>Welcome ${fullName},</p>
        <br>
        <p>Your account has been created successfully.</p>
        <h3>email: ${email}</h3>
        <p>Please login.</p>
        <button>Login</button>
    `
}