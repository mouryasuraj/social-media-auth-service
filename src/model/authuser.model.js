import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt'

const authUserSchema = new Schema({
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
    isEmailVerified: {
        type: Boolean,
        default:false
    }
},
    {
        timestamps: true
    }
)

authUserSchema.methods.isPasswordValid = async function(plainPassword) {
    const isPasswordValid = await bcrypt.compare(plainPassword, this.password)
    return isPasswordValid
}


export const AuthUser = mongoose.model("AuthUser", authUserSchema)

