
import { TOPICS } from "../topis.js";
import producer from "./producer.js";


export const sentOtpEvent = async (payload) =>{
    
    await producer.send({
        topic:TOPICS.SEND_OTP,
        messages:[
            {
                key:payload.email,
                value:JSON.stringify(payload)
            }
        ]
    })
}

