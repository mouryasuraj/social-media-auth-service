
import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process?.env?.NODE_ENV || "local"}` })

export const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET_KEY: process.env.SECRET_KEY,
    CLIENT_URL: process.env.CLIENT_URL,
    SALT_ROUND: process.env.SALT_ROUND,
    PORT: process.env.PORT || 3000,
    NODE_ENV:process.env.NODE_ENV,
    REDIS_URL:process.env.REDIS_URL,
    OTP_TTL:process.env.OTP_TTL,
    OTP_MX_ATMPTS:process.env.OTP_MX_ATMPTS,
    MAIL_FROM:process.env.MAIL_FROM,
    ISSUER:process.env.ISSUER,
    AUDIENCE:process.env.AUDIENCE,
    COOKIE_SECURE:process.env.COOKIE_SECURE,
    KAFKA_BROKER:process.env.KAFKA_BROKER,
};