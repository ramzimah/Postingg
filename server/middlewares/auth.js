const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  //get token from the header
  const token = req.header("x-auth-token");
  //check if the token is sent
  if (!token) {
    return res.status(401).json({ msg: "no token , auth denied" });
  }
  //verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        errors: [{ msg: " the id is invalid, this user doesn't exist" }],
      });
    }
    req.id = decoded.id;
    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({
      msg: "token invalid",
    });
  }
};
