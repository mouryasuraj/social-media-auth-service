export const handleLogin = async (req,res)=>{
    try {
        console.log("Calling this function")
        res.json({status:true, message:"API called successfully"})
    } catch (error) {
        console.log("Something went wrong: ",error)
        res.status(400).json(({status:false, message:"Something went wrong"}))
    }
}