const JWTService = require("../servicejwt/JWTService");
const User = require("../models/user");

const UserDTO = require("../Dto/dtouser");
const { model } = require("mongoose");

const auth = async (req, res, next) => {
  // 1 validate refresh and access Token
  try {
    const { refreshToken, accessToken } = req.cookies;
    if (!refreshToken || !accessToken) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }
    //in authController.js this below line fetch data from return verifyAccesToken wich
    //also recieved data above signAccesToken payload wich is _id:user._id so
    // below code will return our payload and after here we destructure our id
    let _id;
    try {
      //the below lind code should be  JWTService.verifyAccessToken(accessToken)._id
      _id = JWTService.verifyAccessToken(accessToken);
    } catch (error) {
      return next(error);
    }
    // to access user details we write below code for this we import User and userDto in above
    let user;

    try {
      user = await User.findOne({ _id: _id });
    } catch (error) {
      return next(error);
    }
    const userDto = new UserDTO(user);
    req.user = userDto;
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = auth;
