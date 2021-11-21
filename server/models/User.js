const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
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
    savedArticles: [
      {
        article: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "article",
        },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("user", UserSchema);
