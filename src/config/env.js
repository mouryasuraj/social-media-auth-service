
import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process?.env?.NODE_ENV || "local"}` })

export const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET_KEY: process.env.SECRET_KEY,
    SALT_ROUND: process.env.SALT_ROUND,
    PORT: process.env.PORT,
    NODE_ENV:process.env.NODE_ENV,
    REDIS_URL:process.env.REDIS_URL,
    OTP_TTL:process.env.OTP_TTL,
    OTP_MX_ATMPTS:process.env.OTP_MX_ATMPTS,
    SMTP_KEY:process.env.SMTP_KEY,
    SMTP_SERVER:process.env.SMTP_SERVER,
    SMTP_PORT:process.env.SMTP_PORT,
    SMTP_LOGIN:process.env.SMTP_LOGIN,
    MAIL_FROM:process.env.MAIL_FROM,
    ISSUER:process.env.ISSUER,
    AUDIENCE:process.env.AUDIENCE,
    COOKIE_SECURE:process.env.COOKIE_SECURE,
};