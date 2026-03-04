
import { TOPICS } from "../topics.js";
import producer from "./producer.js";


export const sendMailEvent = async (payload) =>{
    
    const res = await producer.send({
        topic:TOPICS.MAIL_ALERT,
        messages:[
            {
                key:payload.email,
                value:JSON.stringify(payload)
            }
        ]
    })

    console.log("produced successfully",res);
    
}

