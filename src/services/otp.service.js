import crypto from 'crypto'
import { AppError, consoleError, emailOtpKey } from '../utils/index.js';
import { env, mailer } from '../config/index.js';
import { redis } from '../config/redis.js';
import { generateEmailStructure } from './index.js';

export const generateOTP = () => {
    return Math.floor(Math.random() * 1000000 + 1)
}

export const hashOTP = (otp) => {
    if (!otp) throw new AppError("OTP is missing", 400)
    const hashedOTP = crypto.createHash('sha256', env.SECRET_KEY).update(String(otp)).digest('hex');
    return hashedOTP;

}

export const storeOTP = async (email, payload) => {
    try {
        if (!email || !payload) throw new AppError("Email or Payload is missing", 400)


        const otp = generateOTP()
        const hashedOtp = hashOTP(otp)

        const key = `email_otp:${email}`
        const value = {
            otpHashed: hashedOtp,
            attempts: 0,
            payload:JSON.stringify(payload)
        }

        // Save to redis
        await redis.hSet(key, value)
        await redis.expire(key, Number(env.OTP_TTL))
        return otp
    } catch (error) {
        throw new AppError("Something went wrong",400)
    }
    // Error Handling


}

export const verifyOTP = async (email, otp) => {
    // Error Handling
    if (!email || !otp) throw new AppError("Email or otp is missing", 400)

    const key = `${emailOtpKey}:${email}`;

    

    // Get OTP data
    const data = await redis.hGetAll(key)

    if (Object.keys(data).length === 0) return {
        valid: false,
        reason: "OTP is expired. Please resent it"
    }

    // Parsed Record
    if (!data?.otpHashed) {
        consoleError({ message: "Hashed OTP not found" })
        return {
            valid: false,
            reason: "Something went wrong"
        }
    }

    // CHeck attempts
    if (Number(data?.attempts) + 1 > Number(env?.OTP_MX_ATMPTS)) {
        await redis.del(key)
        return {
            valid: false,
            reason: "Max Attempts reached. Account is blocked. Please contact your admin."
        }
    }

    // Verify OTP
    if (hashOTP(otp) !== data.otpHashed) {
        await redis.hIncrBy(key, "attempts", 1)
        return {
            valid: false,
            reason: "Invalid OTP"
        }
    }

    // If Verified del key from redis
    await redis.del(key)
    return {
        valid: true,
        payload: JSON.parse(data.payload)
    }
}


export const sendEmail = async (to, body, subject) => await mailer.sendMail(generateEmailStructure(env.MAIL_FROM, to, subject, body))



