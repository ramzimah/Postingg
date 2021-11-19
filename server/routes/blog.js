const express = require("express");
const User = require("../models/User");
const config = require("config");
const { check, validationResult, param } = require("express-validator");
const auth = require("../middlewares/auth");
const Blog = require("../models/Blog");

const router = express.Router();
// @route POST api/blog/create
// @desc a route to create a blog
// @access private
router.post(
  "/create",
  [
    check("title", "please the title of your blog ").isEmail(),
    check("content", "please enter ur content").notEmpty(),
    auth,
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { title, content } = req.body;
      const blog = new Blog({
        title,
        content,
      });
      await blog.save();
      return res.sendStatus(200);
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route GET api/blog/userBlogs/:id
// @desc a route to get all the blogs for a specific user() by id)
// @access public
router.get(
  "/userBlogs/:id",
  [param("id", "id is required").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const id = req.params.id;
      const user = await User.findOne({ where: { id } });
      if (!user) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this user doesn't exist" }],
        });
      }
      const blogs = Blog.findAll({ where: { id } });
      return res.sendStatus(200).json({ blogs });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route POST api/blog/:id
// @desc a route to get a specific blog by its id)
// @access public
router.get(
  "/:id",
  [param("id", "id is required").notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const id = req.params.id;
      const blog = await Blog.findOne({ where: { id } });
      if (!blog) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this blog doesn't exist" }],
        });
      }
      return res.sendStatus(200).json({ blog });
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route POST api/blog/edit/:id
// @desc a route to edit a specific blog by its id
// @access private
router.put(
  "/edit/:id",
  [param("id", "id is required"), auth],
  async (req, res) => {
    const { id } = req.param;
    const { content, title } = req.body;
    try {
      const blog = await Blog.findOne({ where: { id } });
      if (!blog) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this blog doesn't exist" }],
        });
      }
      if (content) blog.content = content;
      if (title) blog.title = title;
      await blog.save();
      return res.sendStatus(200);
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route POST api/blog/delete/:id
// @desc a route to delete a specific blog by its id
// @access private
router.delete(
  "/delete/:id",
  [param("id", "id is required"), auth],
  async (req, res) => {
    const { id } = req.param;
    const authorId = req.id;
    try {
      const blog = await Blog.findOne({ where: { id } });
      if (!blog) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this blog doesn't exist" }],
        });
      }
      if (authorId != blog.id) {
        if (!blog) {
          return res.status(401).json({
            errors: [{ msg: " unauthorized to delete the post" }],
          });
        }
      }
      await Blog.findByIdAndDelete({ id });
      return res.sendStatus(200);
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);
// @route PUT api/blog/like/:id
// @desc a route to like a specific blog by its id
// @access private
router.put(
  "like/:id",
  [param("id", "blog id is required"), auth],
  async (req, res) => {
    const { id } = req.param;
    const { userId } = req.id;
    try {
      const blog = await Blog.findOne({ where: { id } });
      if (!blog) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this blog doesn't exist" }],
        });
      }
      if (
        blogs.likes
          .filter((like) => {
            like.user.toString() === userId;
          })
          .length() > 0
      ) {
        return res.status(400).json({ msg: "Post already liked" });
      }
      blog.likes.unshift({ user: userId });
      await blog.save();
      return res.sendStatus(200).json(blog.likes);
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);

// @route PUT api/blog/like/:id
// @desc a route unlike a specific blog by its id
// @access private
router.put(
  "like/:id",
  [param("id", "blog id is required"), auth],
  async (req, res) => {
    const { id } = req.param;
    const { userId } = req.id;
    try {
      const blog = await Blog.findOne({ where: { id } });
      if (!blog) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this blog doesn't exist" }],
        });
      }
      const index = blog.likes.findIndex((like) => {
        like.user.toString() === userId;
      });

      blog.likes.splice(removeIndex, 1);

      await blog.save();
      return res.sendStatus(200).json(blog.likes);
    } catch (err) {
      console.log(err.message);
      res.sendStatus(500).send("server error");
    }
  }
);

// @route POST api/blog/comment/:id
// @desc a route to comment on a specific blog by its id
// @access private
router.post("comment/:id", auth, async (req, res) => {
  return;
});

// @route POST api/blog/editComment/:id
// @desc a route to edit a comment on a specific blog by its id
// @access private
router.put("editComment/:id", auth, async (req, res) => {
  return;
});
// @route POST api/blog/save/:id
// @desc a route to save a specific blog by its id
// @access private
router.post("save/:id", auth, async (req, res) => {
  return;
});
module.exports = router;
