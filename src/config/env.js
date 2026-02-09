
import dotenv from 'dotenv'
dotenv.config({ path: `.env.${process.env.NODE_ENV || "local"}` })

export const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET_KEY: process.env.SECRET_KEY,
    SALT_ROUND: process.env.SALT_ROUND,
    PORT: process.env.PORT,
};