const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult, param } = require("express-validator");
const createToken = require("../utils/createToken");
const decodeToken = require("../utils/decodeToken");
const auth = require("../middlewares/auth");
const sendmail = require("../utils/sendMail");
const validator = require("../middlewares/validator");

const router = express.Router();
//register team route
router.post(
  "/signup",
  [
    check("username", "please enter ur name").notEmpty(),
    check("email", "please enter ur email").isEmail(),
    check(
      "password",
      "please enter a password with at least 6 caracters"
    ).isLength({ min: 6 }),
    validator,
  ],
  async (req, res) => {
    const { username, password, email, bio } = req.body;

    try {
      //check if user with the same email exists
      let user = await User.findOne({ email });
      //check if user with the same email exists
      if (user) {
        return res.status(400).json({
          errors: [{ msg: "user already exists with the same email" }],
        });
      }
      //check if user with the same name exists
      user = await User.findOne({ username });
      //check if user with the same name exists
      if (user) {
        return res.status(400).json({
          errors: [{ msg: "user already exists with the same username" }],
        });
      }

      //create a user instace
      user = new User({
        username,
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
      res.status(500).send("server error");
    }
  }
);
//login route

router.post(
  "/signin",
  [
    check("email", "please enter a valid email").isEmail(),
    check("password", "please enter a valid password ").isLength({ min: 6 }),
    validator,
  ],
  async (req, res) => {
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
      res.status(500).send("server error");
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
    validator,
  ],
  async (req, res) => {
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
      res.status(500).send("server error");
    }
  }
);
// @route POST api/forgotpassword
// @desc a route to change the forgotten password
// @access public
router.post(
  "/forgotpassword",
  [check("email", "please enter your email ").isEmail(), validator],
  async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        const id = user.id;
        const token = createToken({ id });
        const link = `${config.domaineName}/api/user/forgotpassword/${token}`;
        const mailHtml = `Please click the following link to change your password : <br>${link}`;
        await sendmail("reset password of the blog app ", mailHtml, email);
        return res.sendStatus(200);
      }
      return res
        .status(404)
        .json({ errors: [{ msg: "there is no account with this email  " }] });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
router.get(
  "/forgotpassword/:token",
  [param("token").isString(), validator],
  async (req, res) => {
    try {
      const { token } = req.params;
      const { id } = await decodeToken(token);
      const user = await User.findOne({ id });
      if (!user) {
        return res
          .status(404)
          .json({ errors: [{ msg: "this user doesn't exist  " }] });
      }
      const result = {
        id,
        username: user.username,
      };

      return res.status(200).json(result);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

router.post(
  "/forgotpassword/:token",
  [
    check("password", "please enter your password ").notEmpty(),
    param("token").isString(),
    validator,
  ],
  async (req, res) => {
    try {
      const { token } = req.params;
      let { password } = req.body;
      const { id } = await decodeToken(token);
      const user = await User.findOne({ id });
      if (!user) {
        return res
          .status(404)
          .json({ errors: [{ msg: "this user doesn't exist  " }] });
      } else {
        //encrypt password
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);
        user.password = password;
        await user.save();

        const authToken = await createToken({ id });

        return res.status(200).json({ token: authToken });
      }
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route POST api/user/editProfile/
// @desc a route to edit a uswrProfile
// @access private
router.put("/editprofile", auth, async (req, res) => {
  try {
    const { username, bio, profilePic } = req.body;
    const user = await User.findById({ _id: req.id });
    if (!user) {
      return res
        .status(404)
        .json({ errors: [{ msg: "this user doesn't exist  " }] });
    }
    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (profilePic) user.profilePic = profilePic;
    await user.save();
    return res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});
// @route POST api/user/:id
// @desc a route to get a specific user by his id)
// @access public
router.get("/list", async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({
        errors: [{ msg: " no user registered yet" }],
      });
    }
    return res.status(200).json({ users });
  } catch (err) {
    console.log(err.message);
    res.status(500).send("server error");
  }
});

router.get(
  "/:id",
  [param("id", "valid user id is required").isMongoId(), validator],
  async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this user doesn't exist" }],
        });
      }
      return res.status(200).json({ user });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
