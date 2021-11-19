const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult, param } = require("express-validator");
const auth = require("../middlewares/auth");

const router = express.Router();
module.exports = router;
