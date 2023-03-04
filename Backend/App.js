const express = require("express")
const app = express()
const cookieParser = require("cookie-parser")

if(process.env.NODE_ENV !== "Production"){
    require("dotenv").config({path:"Backend/Config/config.env"})
}


//using middleware here 
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

//IMPORTING ALL routes 
const post = require("./Routes/Post")
const user = require("./Routes/User")

//using routes here
app.use("/api/v1",post)
app.use("/api/v1",user)

module.exports = app