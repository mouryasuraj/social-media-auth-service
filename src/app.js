import express from 'express'
import {connectDB, env} from './config/index.js'
import { authRouter } from './routes/index.js'
import { redis } from './config/redis.js';
import cookieParser from 'cookie-parser'

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())

app.use("/auth", authRouter)


// DB Connection
connectDB().then(() => {
    console.log("DB Connection Established")
    app.listen(3000, () => {
        console.log(`Server is running on port: ${env.PORT}`)
    })
}).catch((error) => {
    console.log(error?.message)
})