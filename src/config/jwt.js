import fs from 'fs'
import path from 'path'

export const privateKey = fs.readFileSync(path.join(process.cwd(), "keys/private.key"), 'utf8')