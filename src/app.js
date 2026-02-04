import express from 'express'
import dotenv from 'dotenv'
import {connectDB} from './connections/index.js'
import { authRouter } from './routes/index.js'
dotenv.config({path:`.env.${process.env.NODE_ENV}`})

const app = express()

// Middleware
app.use(express.json())

app.use("/auth", authRouter)

// DB Connection
connectDB().then(() => {
    console.log("DB Connection Established")
    app.listen(3000, () => {
        console.log("Server is running on port: 3000")
    })
}).catch((error) => {
    console.log(error?.message)
})