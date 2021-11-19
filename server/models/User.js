const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: null,
    },
    profilePic: {
      type: String,
      default: null,
    },
    savedBlogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "blog",
        default: null,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", UserSchema);
