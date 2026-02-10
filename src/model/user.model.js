import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt'
import { env } from '../config/index.js';

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: String,
        required: true,
        trim: true
    },
    skills: {
        type: [String],
    },
    about: {
        type: String,
        trim: true
    },
    photoUrl: {
        type: String,
        trim: true
    },
    isEmailVerified: {
        type: Boolean,
        default:false
    }
},
    {
        timestamps: true
    }
)

export const User = mongoose.model("User", userSchema)

