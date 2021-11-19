const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult, param } = require("express-validator");
const createToken = require("../utils/createToken");
const decodeToken = require("../utils/decodeToken");
const auth = require("../middlewares/auth");
const sendmail = require("../utils/sendMail");

const router = express.Router();
//register team route
router.post(
  "/signup",
  check("fullname", "please enter ur name").notEmpty(),
  check("email", "please enter ur email").isEmail(),
  check(
    "password",
    "please enter a password with at least 6 caracters"
  ).isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { fullname, password, email, bio } = req.body;

    try {
      //check if user exists
      let user = await User.findOne({ email });
      //check if team exists
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exists" }] });
      }

      //create a user instace
      user = new User({
        fullname,
        email,
        password,
        bio,
      });

      //encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      //return jsonwebtoken
      const id = user.id;
      const token = createToken({ id });
      res.json({ token });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
//login route

router.post(
  "/signin",
  check("email", "please enter a valid email").isEmail(),
  check("password", "please enter a valid password ").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ errors: [{ msg: "this email doesn't exist" }] });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({
          errors: [{ msg: "wrong password" }],
        });

      //return jsonwebtoken
      const id = user.id;
      const token = createToken({ id });
      res.json({ token });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route PUT api/changepassword
// @desc a route to change the password
// @access private
router.put(
  "/changepassword",
  [
    check("password", "please enter the actual password").exists(),
    check("newPassword", "please enter the new password").exists(),
    auth,
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { password, newPassword } = req.body;
    try {
      const user = await User.findOne({ where: { id: req.id } });

      if (!user) {
        return res
          .status(404)
          .json({ errors: [{ msg: "this user doesn't exist  " }] });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({
          errors: [{ msg: "wrong password" }],
        });
      //encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await User.updateOne({ password }, { where: { id: user.id } });

      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route POST api/forgotpassword
// @desc a route to change the forgotten password
// @access public
router.post(
  "/forgotpassword",
  [check("email", "please enter your email ").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      const id = user.id;
      if (user) {
        const token = createToken({ id });
        const link = `${config.domaineName}/api/user/forgotpassword/${token}`;
        const mailHtml = `Please click the following link to change your password : <br>${link}`;
        await sendmail("reset password of teamab ", mailHtml, email);
      }
      return res.sendStatus(200);
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
router.get(
  "/forgotpassword/:token",
  [param("token").isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { token } = req.params;

      const { id } = await decodeToken(token);
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res
          .status(404)
          .json({ errors: [{ msg: "this user doesn't exist  " }] });
      }
      const result = {
        id,
        fullName: user.fullname,
      };

      return res.status(200).json(result);
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);

router.post(
  "/forgotpassword/:token",
  [check("password", "please enter your password "), param("token").isString()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { token } = req.params;
      let { password } = req.body;

      const { id } = await decodeToken(token);
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res
          .status(404)
          .json({ errors: [{ msg: "this user doesn't exist  " }] });
      }

      //encrypt password
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      await User.updateOne({ password }, { where: { id: user.id } });

      const authToken = await createToken({ id });

      return res.status(200).json({ token: authToken });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route POST api/user/editProfile/
// @desc a route to edit a comment on a specific blog by its id
// @access private
router.put("editprofile/:id", auth, async (req, res) => {});
module.exports = router;
