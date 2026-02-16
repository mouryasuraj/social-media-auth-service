import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt'

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

userSchema.methods.isPasswordValid = function(plainPassword, hashedPassword) {
    const isPasswordValid = bcrypt.compare(plainPassword, hashedPassword)
    return isPasswordValid
}


export const User = mongoose.model("User", userSchema)

