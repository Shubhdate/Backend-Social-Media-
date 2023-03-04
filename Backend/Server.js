const app = require("./App")

//this is for coonecting Databse with server
const {connectDatabase} = require("./Config/Database")
connectDatabase()







app.listen(process.env.PORT, () => {
    console.log(`Server is running on PORT ${process.env.PORT}`)
})