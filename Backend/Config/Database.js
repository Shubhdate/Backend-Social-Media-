//this is for coonecting Databse with server
const mongoose = require("mongoose")

exports.connectDatabase = () => {
    mongoose.connect(process.env.MONGO_URL)
    .then((con) => console.log(`Database is Connected : ${con.connection.host}`))
    .catch((error) => console.log(error))
}