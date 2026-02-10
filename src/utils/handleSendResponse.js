export const handleSendResponse = (res,statusCode,status,msg,data) =>{
    const response = {message:msg, status:status}
    if(data){
        response["data"] = data
    }
    res.status(statusCode).json(response)
}