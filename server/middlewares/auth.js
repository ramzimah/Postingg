const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  //get token from the header
  const token = req.header("x-auth-token");
  //check if the token is sent
  if (!token) {
    return res.status(401).json({ msg: "no token , auth denied" });
  }
  //verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.id = decoded.id;
    next();
  } catch (err) {
    console.log(err.message);
    res.status(401).json({
      msg: "token invalid",
    });
  }
};
