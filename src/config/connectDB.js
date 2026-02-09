import mongoose from 'mongoose'
import { env } from './index.js';

export const connectDB = async () => {
    console.log("aesrdtfyguhjk", env.MONGODB_URI)
    try {
        if (!env.MONGODB_URI) throw new Error("DB URL is missing")
        await mongoose.connect(env.MONGODB_URI)
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        throw error; // IMPORTANT
    }
}
