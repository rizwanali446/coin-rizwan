const mongoose = require("mongoose");

const connectionString =
  "mongodb+srv://smpsolution:test1234@cluster0.9s9isuh.mongodb.net/coin-rizwan?retryWrites=true&w=majority";

const dbConnect = async () => {
  try {
    mongoose.set(`strictQuery`, false);
    const conn = await mongoose.connect(connectionString);
    console.log(`Database connected to host rizwan: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error:${error}`);
  }
};
module.exports = dbConnect;
//this dbConnecet will now export in server.js with the following below code
// const dbConnect=require("./Database/dbs");
// dbConncet();
