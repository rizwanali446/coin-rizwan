const express = require("express");
const dbConnect = require("./Database/dbs");
const router = require("./routes/rout");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");

const app = express();
app.use(cookieParser());
app.use(express.json()); // authControoler sy here code lagya
// now we run msg on localhost:5000 by given below command app.use(router);
app.use(router);
const PORT = 5000;
dbConnect();
app.use("/storage", express.static("storage"));
app.use(errorHandler); //errorHandler is always written end of code

//app.get("/",(req,res)=>res.json("Hello Rizwan0001"));   this line we wil shifted to our rout.js to make code concse
// in the extenstion code router.get("./test",(req,res)=>res.json({msg:"sahi working"}))
app.listen(PORT, console.log(`Backend is running on port:${PORT}`));
