const express = require("express");
const User = require("../models/User");
const config = require("config");
const { check, param } = require("express-validator");
const auth = require("../middlewares/auth");
const Article = require("../models/Article");
const validator = require("../middlewares/validator");
const router = express.Router();

// @route POST api/article/create
// @desc a route to create an article
// @access private
router.post(
  "/create",
  [
    check("title", "please the title of your article ").notEmpty(),
    check("content", "please enter ur content").notEmpty(),
    auth,
    validator,
  ],
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const author = req.id;
      const article = new Article({
        author,
        title,
        content,
      });
      await article.save();
      return res.status(200).json({ article });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route GET api/article/userArticles/:id
// @desc a route to get all the articles for a specific user() by id)
// @access public
router.get(
  "/userArticles/:id",
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
      const articles = await Article.find({ author: id });
      return res.status(200).json({ articles });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route POST api/article/:id
// @desc a route to get a specific article by its id)
// @access public
router.get(
  "/:id",
  [param("id", "valid article id is required").isMongoId(), validator],
  async (req, res) => {
    try {
      const id = req.params.id;
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      return res.status(200).json({ article });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route POST api/article/edit/:id
// @desc a route to edit a specific article by its id
// @access private
router.put(
  "/edit/:id",
  [param("id", "valid article id is required").isMongoId(), auth, validator],
  async (req, res) => {
    const { id } = req.params;
    const { content, title } = req.body;
    try {
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      if (content) article.content = content;
      if (title) article.title = title;
      if (!content && !title) {
        return res.status(400).json({
          errors: [{ msg: "none of content and title is specified" }],
        });
      }
      await article.save();
      return res.status(200).json(article);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route POST api/article/delete/:id
// @desc a route to delete a specific article by its id
// @access private
router.delete(
  "/delete/:id",
  [param("id", "id is required").isMongoId(), validator, auth],
  async (req, res) => {
    const { id } = req.params;
    const authorId = req.id;
    try {
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      if (authorId != article.author) {
        return res.status(401).json({
          errors: [{ msg: " unauthorized to delete the article" }],
        });
      }
      await Article.findOneAndDelete({ id });
      return res.sendStatus(200);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route PUT api/blog/like/:id
// @desc a route to like a specific article by its id
// @access private
router.put(
  "/like/:id",
  [param("id", "a valid article id is required").isMongoId(), auth, validator],
  async (req, res) => {
    const id = req.params.id;
    const userId = req.id;
    try {
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }

      if (
        article.likes.filter((like) => like.user.toString() === req.id).length >
        0
      ) {
        return res.status(400).json({ msg: "article already liked" });
      }
      article.likes.unshift({ user: req.id });
      await article.save();
      return res.status(200).json({ likes: article.likes });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route PUT api/article/like/:id
// @desc a route unlike a specific article by its id
// @access private
router.put(
  "/unlike/:id",
  [param("id", "article id is required").isMongoId(), validator, auth],
  async (req, res) => {
    const { id } = req.params;
    const userId = req.id;
    try {
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      //check if the article has been already liked
      if (
        article.likes.filter((like) => like.user.toString() === req.id)
          .length === 0
      ) {
        return res
          .status(400)
          .json({ msg: "the article has not  been liked yet" });
      }
      const index = article.likes
        .map((like) => like.user.toString())
        .indexOf(req.id);
      article.likes.splice(index, 1);
      await article.save();
      return res.status(200).json({ likes: article.likes });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route PUT api/article/comment/:id
// @desc a route to comment on a specific article by its id
// @access private
router.put(
  "/comment/:id",
  [
    param("id", "article id is required").isMongoId(),
    check("content", "content is required").isString(),
    validator,
    auth,
  ],
  async (req, res) => {
    const { id } = req.params;
    const { userId } = req.id;
    const { content } = req.body;
    try {
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      const newComment = {
        content: content,
        user: req.id,
      };

      article.comments.unshift(newComment);
      await article.save();
      return res.status(200).json({ allComments: article.comments });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);

// @route POST api/article/editComment/:id
// @desc a route to edit a comment on a specific article by its id
// @access private
router.put(
  "/editComment/:articleId/:commentId",
  [
    param("articleId", " valid articleId is required").isMongoId(),
    param("commentId", "valid commentId is required").isMongoId(),
    check("newContent", "the new content is required").isString(),
    validator,
    auth,
  ],
  async (req, res) => {
    const { newContent } = req.body;
    const { articleId, commentId } = req.params;
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      //pull out comment
      const comment = await article.comments.find(
        (comment) => comment.id.toString() === commentId
      );
      //check if the comment exists
      if (!comment) {
        return res.status(404).json({ msg: "comment does not exist" });
      }
      const index = article.comments
        .map((comment) => comment.id.toString())
        .indexOf(commentId);

      if (req.id !== article.comments[index].user.toString()) {
        return res.status(401).json({
          errors: [{ msg: " unauthorized to edit the comment" }],
        });
      }

      article.comments[index].content = newContent;
      await article.save();
      return res.status(200).json(article.comments[index]);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route PUT api/article/deleteComment/:articleId/:commentId
// @desc a route to delete a comment on a specific article by its id
// @access private
router.put(
  "/deleteComment/:articleId/:commentId",
  [
    param("articleId", "article id is required").isMongoId(),
    param("commentId", "comment id is required").isMongoId(),
    auth,
    validator,
  ],
  async (req, res) => {
    const { articleId, commentId } = req.params;
    const { userId } = req.id;
    try {
      const article = await Article.findById(articleId);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      //check if the comment exists
      const comment = await article.comments.find(
        (comment) => comment.id === req.params.commentId
      );
      if (!comment) {
        return res.status(404).json({ msg: "comment does not exist" });
      }
      const index = article.comments
        .map((comment) => comment._id.toString())
        .indexOf(commentId);

      if (req.id !== article.comments[index].user.toString()) {
        return res.status(401).json({
          errors: [{ msg: " unauthorized to delete the comment" }],
        });
      }

      article.comments.splice(index, 1);
      await article.save();
      return res.status(200).json(article.comments);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route PUT api/article/save/:id
// @desc a route to save a specific article by its id
// @access private
router.put(
  "/save/:id",
  [param("id", "article id is required").isMongoId(), validator, auth],
  async (req, res) => {
    const id = req.params.id;
    const userId = req.id;
    try {
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      const user = await User.findById(userId);
      if (
        user.savedArticles.filter(
          (savedArticle) => savedArticle.article.toString() === id
        ).length > 0
      ) {
        return res.status(400).json({ msg: "article already saved" });
      }
      user.savedArticles.unshift({ article: id });
      await user.save();
      return res.status(200).json({ savedarticles: user.savedArticles });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
// @route PUT api/article/unsave/:id
// @desc a route unsave a specific article by its id
// @access private
router.put(
  "/unsave/:id",
  [param("id", "article id is required").isMongoId(), validator, auth],
  async (req, res) => {
    const id = req.params.id;
    const userId = req.id;
    try {
      const article = await Article.findById(id);
      if (!article) {
        return res.status(404).json({
          errors: [{ msg: " the id is invalid, this article doesn't exist" }],
        });
      }
      const user = await User.findById(userId);

      //check if the article has been already saved
      if (
        user.savedArticles.filter(
          (savedArticle) => savedArticle.article.toString() === id
        ).length === 0
      ) {
        return res
          .status(400)
          .json({ msg: "the article has not  been saved yet" });
      }
      const index = user.savedArticles
        .map((savedArticle) => user.savedArticles.toString())
        .indexOf(id);
      user.savedArticles.splice(index, 1);
      await user.save();
      return res.status(200).json({ savedarticles: user.savedArticles });
    } catch (err) {
      console.log(err.message);
      res.status(500).send("server error");
    }
  }
);
module.exports = router;
