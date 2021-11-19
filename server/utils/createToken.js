const jwt = require("jsonwebtoken");
const config = require("config");
const createToken = (userInfo) => {
  return jwt.sign(userInfo, config.get("jwtSecret"), {
    expiresIn: 360000,
  });
};
module.exports = createToken;
