const { validationError } = require("joi"); // here we create const {validationError} from authController joi
const errorHandler = (error, req, res, next) => {
  //default error,
  let status = 500;
  let data = {
    message: "Internal Server error",
  };
  //console.log("--")
  //console.error(error)
  if (error.details) {
    // instanceof mean of error ocuur {validationError}

    status = 401; //here is i think mistake
    // status=error.status;               //from authController then we write this  <===
    data.message = error.details[0].message;
    return res.status(status).json(data);
  }
  if (error.status) {
    status = error.status;
  }
  if (error.message) {
    data.message = error.message;
  }
  //console.error(error);
  return res.status(status).json(data);
};
module.exports = errorHandler; // this errorHandler now will import to server.js by following code
// const errorHandler=require("./middlewares/errorHandler"); app.use(errorhandler)
