import fs from 'fs'
import path from 'path'

export const privateKey = fs.readFileSync(path.join(process.cwd(), "keys/private.key"),'utf8')
export const publicKey = fs.readFileSync(path.join(process.cwd(), "keys/public.key"), 'utf8')