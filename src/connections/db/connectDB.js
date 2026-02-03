import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) throw new Error("DB URL is missing")
        await mongoose.connect(process.env.MONGODB_URI)
    } catch (error) {
        console.error("MongoDB connection error:", error.message);
        throw error; // IMPORTANT
    }
}
