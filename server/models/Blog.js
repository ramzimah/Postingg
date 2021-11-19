const { UUID } = require("bson");
const mongoose = require("mongoose");
const BlogSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      default: null,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      unique: true,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          default: null,
        },
      },
    ],
    comments: [
      {
        commentId: { type: mongoose.Schema.Types.ObjectId },
        content: { type: "String" },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        default: null,
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("blog", BlogSchema);
