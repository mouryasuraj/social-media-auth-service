import { createClient } from "redis";
import { env } from "./index.js";
import { consoleError } from "../utils/index.js";

export const redis = createClient({
    url:env.REDIS_URL
})

redis.on('connect',()=>{
    console.log("Redis connected successfully")
})

redis.on('error',(err)=>{
    consoleError(err)
})

await redis.connect()