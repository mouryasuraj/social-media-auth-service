export const handleSendResponse = (res,status,msg,data) =>{
    const response = {message:msg, status:true}
    if(data){
        response["data"] = data
    }
    res.status(status).json(response)
}