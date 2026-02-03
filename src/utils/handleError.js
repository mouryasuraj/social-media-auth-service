const handleError = (res, status, msg) =>{
    if(res){
        res.status(status).json({message:msg, status:false})
    }
}

export {handleError}