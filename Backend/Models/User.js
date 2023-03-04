const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const UserSchema = new mongoose.Schema({
    //this is for users informaton what we wnat
    name:{
        type:String,
        required:[true,"Please Enter your FullName"]
    },
    email:{
        type:String,
        required:[true,"Please Enter your Email"],
        unique:[true,"Email already exist"]
    },
    password:{
        type:String,
        required:[true,"Please Enter Pasword"],
        minlength:[4,"Password should be of 4 letters/number/etc"],
        select:false,
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
    }],
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    }],
    avatar:{
        publiv_id:String,
        url:String
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
})


// this is for saving password as bcrypt and by hasing method
UserSchema.pre("save", async function (next) {
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
        //10 means utna strong password banega 
    }
    next()
})



//for login 
UserSchema.methods.matchPassword = async function (password) {
    //comparing the users password with our hash password 
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateToken = function (){
    return jwt.sign({_id:this._id}, process.env.JWT_SECRET)
}

//for resetPassword ka ttoken ke liye
UserSchema.methods.getResetPasswordToken = function (){
    const resetToken = crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model("User",UserSchema)