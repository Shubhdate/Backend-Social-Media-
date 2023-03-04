const User = require("../Models/User")
const Post = require("../Models/Post")
const { post } = require("../Routes/User")
const {sendEmail} = require("../Middleware/SendEmail")
const crypto = require("crypto")


//this is for new registering login
exports.register = async(req,res) => {
    try {
        const {name,email,password} = req.body

        //agar user pahile se preesent hai
        let user = await User.findOne({email})
        if(user) 
        {
            return res.status(201).json({
                sucess:true,
                message:"User already present"
            })
        }

        //agar user nahi present hai to new user bano do
        user = await User.create({
            email,
            name,
            password,
            avatar:{public_id:"sample_id",url:"smapleurl"}
        })

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),//this for expiring of cookies
            httpOnly:true,
        }

        const token = await user.generateToken()
        res.status(201).cookie("token",token,options)
        .json({
            sucess:true,
            // message:"User registerded hogya"
            user,
            token
        })
    } 
    catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//this is for login existing users 
exports.login = async(req,res) => {
    try {
        const {email,password} = req.body

        const user = await User.findOne({email}).select("+password")

        if(!user){
            return res.status(201).json({
                sucess:false,
                message:"User nahi hai"
            })
        }
        const isMatch = await user.matchPassword(password)

        if(!isMatch){
            return res.status(400).json({
                sucess:true,
                message:"Password galat hai"
            })
        }

        const token = await user.generateToken()
        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),//this for expiring of cookies
            httpOnly:true,
        }

        res.status(201).cookie("token",token,options)
        .json({
            sucess:true,
            // message:"User registerded hogya"
            user,
            token
        })


    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}




//this is for followers post 
exports.followUser = async(req,res) => {
    try {
        const userToFollow = await User.findById(req.params.id)
        const loggedInUser = await User.findById(req.user._id)

        if(!userToFollow){
            return res.status(500).json({
                sucess:false,
                message:"User not found"
            })
        }

        if(loggedInUser.following.includes(userToFollow._id)){

            const indexFollowing = loggedInUser.following.indexOf(userToFollow._id)
            const indexFollowers = userToFollow.followers.indexOf(loggedInUser._id)

            loggedInUser.following.splice(indexFollowing,1)
            userToFollow.followers.splice(indexFollowers,1)

            await loggedInUser.save()
            await userToFollow.save()

            return res.status(200).json({
                sucess:true,
                message:"User Ufollowed"
            })
        }
        else{
            loggedInUser.following.push(userToFollow._id)
            userToFollow.followers.push(loggedInUser._id)
            await loggedInUser.save()
            await userToFollow.save()

            return res.status(201).json({
                sucess:true,
                message:"User followed"
            })
        }
 
        
    } 
    catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//this is for logging out
exports.loggedOut = async(req,res) => {
    try {
        
        res.status(200).cookie("token",null,
        {expires: new Date(Date.now()),
        httpOnly:true}).json({
            sucess:true,
            message:"logged out"
        })

    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//updating newPassword
exports.updatePassword = async(req,res) => {
    try {
        
        const user = await User.findById(req.user._id).select("+password")
        const {oldPassword, newPassword} = req.body 
        

        if(!oldPassword || !newPassword){
            return res.status(500).json({
                sucess:false,
                message:"kuch toh type karo password"
            })
        }

        const isMatch =  await user.matchPassword(oldPassword)
        
        if(!isMatch){
            res.status(500).json({
                sucess:false,
                message:"INCORRECT OLD PASSWORD HAI"
            })
        }

        user.password = newPassword
        await user.save()

        return res.status(200).json({
            sucess:true,
            message:"NEW PASSWORD UPDATED"
        })

    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//updatingProfile
exports.updateProfile = async(req,res) => {
    try {
        
        const user = await User.findById(req.user._id)
        const {email,name} = req.body 

        if(name){
            user.name = name
        }
        if(email){
            user.email = email
        }
        await user.save()
        return res.status(200).json({
            sucess:true,
            message:"PROFILE UPDATED"
        })


    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//deleteUser
exports.deleteUser = async(req,res) => {
    try {
        
        const user = await User.findById(req.user._id)
        await user.remove()

        //deleting all posts after removing of profile
        const posts = user.posts
        for(let i =0; i < posts.length; i++){
            const post = await Post.findById(posts[i])
            await post.remove()
        }

        //delete all followers ke following ki list associate with it 
        const followers = user.followers
        const userId = user._id
        for(let i =0; i < followers.length; i++){
            const follower = await User.findById(followers[i])
            const index = follower.following.indexOf(userId)
            follower.following.splice(index,1)
            await follower.save()
        }

        //delete all following ke followers ki list associate with it 
        const following = user.following
        const userIdd = user._id
        for(let i =0; i < following.length; i++){
            const follows = await User.findById(following[i])
            const index = follows.followers.indexOf(userIdd)
            follows.followers.splice(index,1)
            await follows.save()
        }
        

        //logging out user after delteing profile 
        res.cookie("token",null,
        {expires: new Date(Date.now()),
        httpOnly:true})

        return res.status(200).json({
            sucess:true,
            message:"PROFILE DELETED along with all posts"
        })


    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//myProfile 
exports.myProfile = async(req,res) => {
    try {
        
        const user = await User.findById(req.user._id).populate("posts")
        
        return res.status(200).json({
            sucess:true,
            message:"Showing your Profile",
            user
        })


    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//userProfile 
exports.getUserProfile = async(req,res) => {
    try {
        
        const user = await User.findById(req.params.id).populate("posts")
        
        if(!user){
            res.status(500).json({
                sucess:false,
                message:"User not found"
            })
        }

        return res.status(200).json({
            sucess:true,
            message:"Showing User Profile",
            user
        })


    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//getting all users 
exports.getAllUserProfile = async(req,res) => {
    try {
        
        const users = await User.find({})

        return res.status(200).json({
            sucess:true,
            message:"Showing All User Profile",
            users
        })


    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}



//for forgetting and reseting password
exports.forgotPassword = async(req,res) => {
    try {
        
        const user = await User.findOne({email:req.body.email})
        if(!user){
            res.status(500).json({
                sucess:false,
                message:"User not found"
            })
        }

        const resetPasswordToken = user.getResetPasswordToken()
        await user.save()

        const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`
        const message = `Reset your password by clicking on the link : \n\n ${resetUrl}`
        
        try {
            await sendEmail({
                email:user.email,
                subject:"Reset Password",
                message
            })
            return res.status(200).json({
                sucess:true,
                message:`email sent to ${user.email}`
            })
        } 
        catch (error) {
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined
            await user.save() 
            res.status(500).json({
                sucess:false,
                message:error.message
            })
        }


    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}


//for resetting new pasword 
exports.resetPassword = async(req,res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire:{$gt: Date.now()}
        })

        if(!user){
            return  res.status(500).json({
                sucess:false,
                message:"Token is invalid or has expired"
            })
        }
        
        user.password = req.body.password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save() 
        res.status(200).json({
            sucess:true,
            message:"Password updated successfully"
        })
    } 
    catch (error) {
        res.status(500).json({
            sucess:false,
            message:error.message
        })
    }
}
