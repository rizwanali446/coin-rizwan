const express = require("express"); // router will work only export or require express not mongoose
const authController = require("../controller/authController");
const auth = require("../middlewares/auth");
const router = express.Router(); // we first create this router in rout.js and then we export to main server.js
//and router will start with express like  const router=express.Router();
const blogController = require("../controller/blogController");
const commentController = require("../controller/commentController");
//Testing
router.get("/test", (req, res) => res.json({ msg: "Sahi Working" })); // this is also tested succesfully in insomnia

// user
//register
router.post("/register", authController.register); // authController controlled our register and login requests coming from rout.js

//login
router.post("/login", authController.login);

//logout
router.post("/logout", auth, authController.logout);
//refresh controller 3:26:00
router.post("/refresh", authController.refresh);

//blog
//CRUD

//create
router.post("/blog", auth, blogController.create);
//get  all blogs
router.get("/blog/all", auth, blogController.getAll);
// get blog by id
router.get("/blog/:id", auth, blogController.getById);
//update blog
router.put("/blog", auth, blogController.update);
//delte blog
router.delete("/blog/:id", auth, blogController.delete);
//comment

//create commnet
router.post("/comment", auth, commentController.create);
//read commnet by  get method
router.get("/comment/:id", auth, commentController.getById);
module.exports = router;
