const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/token");
const { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../config/env");
/*const ACCESS_TOKEN_SECRET =
  "e56993a69bb931ca5a7930be3beffbeb786cef55493f241a9cf89ad37089d612c9a85557c117e9a200400d2a15853f43c764da0e5f62c8e9d5db73171badec39";
const REFRESH_TOKEN_SECRET =
  "4a624b251e236a435bec811cd2c8c9e2a1c90fe5734a23e30d56c470c24abf6ae16f39f16e4fabd49090eb248f230f0568688899cf19ae876559b387dad5485b";
*/
class jWTService {
  // sign Access token
  static signAccessToken(payload, expiryTime) {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: expiryTime });
  }
  //sign Refresh token

  static signRefreshToken(payload, expiryTime) {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: expiryTime });
  }
  // verify Access token
  static verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  }
  // verify refresh token    const RefreshToken = require("../models/token");
  static verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  }
  // store refresh token   2:47 we import
  static async storeRefreshToken(token, userId) {
    try {
      const rt = new RefreshToken({
        token: token,
        userId: userId,
      }); // try to understand someone
      // to store in db
      await rt.save();
    } catch (error) {
      return console.error(error);
    }
  }
}
module.exports = jWTService; // now we integrate controller with jwt to login register controller 2:49:
// with the help of cookie-parser dependency and then
//we go to authController.js and integrate register and login
