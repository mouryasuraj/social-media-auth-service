import nodemailer from 'nodemailer'
import { env } from './index.js'

export const mailer = nodemailer.createTransport({
    host:env.SMTP_SERVER,
    port:env.SMTP_PORT,
    secure:false,
    auth:{
        user:env.SMTP_LOGIN,
        pass:env.SMTP_KEY
    }
})