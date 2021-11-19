const jwt = require("jsonwebtoken");
const config = require("config");

const decodeToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    return decoded;
  } catch (err) {
    console.log("err", err);
  }
};
module.exports = decodeToken;
