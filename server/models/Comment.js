const mongoose = require("mongoose");
const BlogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    content: {
      type: String,
      required: true,
      unique: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "blog",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("blog", BlogSchema);
