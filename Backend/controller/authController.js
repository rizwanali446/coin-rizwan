//we create this authController to handle router from rout  system login and much more
// also when we received many requests from ./router/routs  this authController will handle our requests
const Joi = require("joi");
const User = require("../models/user"); // this now not crash nodemon in terminal
const bcrypt = require("bcryptjs");
const RefreshToken = require("../models/token");
const UserDTO = require("../Dto/dtouser"); // userDto make our own variable there is no restriction to import prevoius name
const jWTService = require("../servicejwt/JWTService");
const passwordPatteren = /^(?=.*[a-z])(?=.*[a-z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
  async register(req, res, next) {
    // (a)   1. validate user input manual or via library and here we use npm joi library  time 2:00:00
    const userRegisterSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      name: Joi.string().max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().pattern(passwordPatteren).required(),
      confirmPassword: Joi.ref("password"),
    });
    //now we validate above userRegisterschema below by code
    const { error } = userRegisterSchema.validate(req.body, {
      abortEarly: false,
    }); //user data coming from req body
    // 2 if error in validation => return error via middleware we make foler middleware and inside make file errorHandler.js
    // here error complete code we write in /middleware/errorHandler
    // now writing error complete code in /middlewere/errorHandler our server.js will never crash
    if (error) {
      return next(error);
    }
    //3 if email or username already registered> return an error
    // also here we chcek if email is not alreadry registered
    //before writing below code first we import above to add const User=("../models/user")

    const { email, username, name, password } = req.body;
    try {
      const emailInUse = await User.exists({ email });
      const usernameInUse = await User.exists({ username });
      if (emailInUse) {
        const error = {
          status: 409,
          message: "Email alread registered, use another email!",
        };
        return next(error);
      }
      if (usernameInUse) {
        const error = {
          status: 409,
          message: "username is already exists pls choose another",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //4 if no error we process password hash
    // if we hash pswd abc123-> then system give jsdlkfjkjjja
    // and if use login abcd123 then sytem failed to login
    // for password hash we install dependeny bcryptjs in terminal
    // before writing below paswrd code we first import above
    const hashedPassword = await bcrypt.hash(password, 10);
    //5 store user data in db we required username,name,email,password

    let accessToken;
    let refreshToken;
    let user;
    try {
      const userToRegister = new User({
        //here const userRegisterSchema is taken from above alreadywrtien function
        username, // also we enclosed  <-- const userToRegister=new... to try catch to integrate jwt
        name,
        email,
        password: hashedPassword,
      });
      user = await userToRegister.save();
      // Below here we work now token generatin to integrate regiser user
      // for this we import above  const JWTService = require("../service/JWTService");
      accessToken = jWTService.signAccessToken(
        { _id: user._id, username: user.username },
        "30m"
      );
      refreshToken = jWTService.signRefreshToken({ _id: user.id }, "60m");
    } catch (error) {
      return next(error);
    }
    // cookei setting of refreshToken and accessToken
    // store refresh token in db

    await jWTService.storeRefreshToken(refreshToken, user._id);

    // send token in cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24, //24 hour
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    //6 response send to user
    const userDto = new UserDTO(user);
    return res.status(201).json({ user: userDto, auth: true });
  },

  // (b) 1 now  we validata login input via joi
  async login(req, res, next) {
    const userLoginSchema = Joi.object({
      username: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPatteren).required(),
    });
    const { error } = userLoginSchema.validate(req.body);
    // 2 if error in validation => return error via middleware we make foler middleware and inside make file errorHandler.js
    // here error complete code we write in /middleware/errorHandler
    if (error) {
      return next(error);
    }
    //  3 now we check username, password by try catch method
    const { username, password } = req.body;
    let accessToken;
    let refreshToken;
    let user;
    try {
      //match username
      user = await User.findOne({ username: username }); // this code mean username matched

      if (!user) {
        const error = {
          // this code mean username is not matched
          status: 401,
          message: "Invalid username or password",
        };
        return next(error);
      }
      // now we match password first req.body password hashed then proceed
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        const error = {
          status: 401,
          message: "Invalid username or password",
        };
        return next(error);
      }
      accessToken = jWTService.signAccessToken(
        { _id: user._id, username: user.username },
        "30m"
      );
      refreshToken = jWTService.signRefreshToken({ _id: user.id }, "60m");
    } catch {
      return next(error);
    }
    // update refresh token in db   this below method not include in Register input by try catch method
    try {
      await RefreshToken.updateOne(
        {
          _id: user._id,
        },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }

    // cookei setting of refreshToken and accessToken
    // store refresh token in db

    //jWTService.storeRefreshToken(refreshToken, user._id);

    // send token in cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24, //24 hour
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true }); // here we can also user
  },

  async logout(req, res, next) {
    // 1. Delte refresh token from database(db) wich is exist in cookies
    const { refreshToken } = req.cookies;
    try {
      await RefreshToken.deleteOne({ token: refreshToken });
    } catch (error) {
      return next(error);
    }
    // now dont validation in here we validate  we make another middleware file name auth.js and then use
    //2 delete Cookeis from accessToken and refreshToken
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    // 3 responce send to user
    res.status(200).json({ user: null, auth: false });
  },
  async refresh(req, res, next) {
    //1 get refreshToken from cookeis
    //2 verify refreshToken
    //3  gerratre new token
    //4 update db,return responce
    ///////////////////////////////NOW START BELOW
    //1 get refreshToken from cookeis
    const originalRefreshToken = req.cookies.refreshToken;
    //2 verify refreshToken

    let _id;
    try {
      _id = jWTService.verifyRefreshToken(originalRefreshToken)._id;
    } catch (e) {
      //here we declare e is local variable
      const error = {
        status: 401,
        message: "Unauthrized",
      };
      return next(error);
    }
    try {
      const match = RefreshToken.findOne({
        _id,
        token: originalRefreshToken,
      });
      if (!match) {
        const error = {
          status: 401,
          message: "Unauthrized",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
    //3  gerratre new token from both access and refresh

    try {
      const accessToken = jWTService.signAccessToken({ _id }, "30");
      const refreshToken = jWTService.signRefreshToken({ _id }, "60");
      await RefreshToken.updateOne({ _id }, { token: refreshToken });
      res.cookie("accesssToken", accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
      res.cookie("refreshToken", refreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
      });
    } catch (error) {
      return next(error);
    }
    //4 update db,return responce
    const user = await User.findOne({ _id });
    const userDto = new UserDTO(user);
    return res.status(200).json({ user: userDto, auth: true });
  },
};
module.exports = authController;
