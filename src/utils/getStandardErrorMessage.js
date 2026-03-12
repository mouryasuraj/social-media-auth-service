import { env } from "../config/index.js"
import { somethingWentWrongTxt } from "./index.js"

export const getStandardErrorMessage = (e) =>{
    return env.NODE_ENV==="production" ? somethingWentWrongTxt : e?.message || somethingWentWrongTxt
}