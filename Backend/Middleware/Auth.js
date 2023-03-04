const User = require("../Models/User")
const jwt = require("jsonwebtoken")

exports.isAuthenticated = async (req,res,next) => {
    try {
        const {token} = req.cookies 
        
        if(!token) {
            return res.status(401).json({
                message:"phele login karo fir post bana sakte ho"
            })
        }

        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded._id)
        next()
    } 
    catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}