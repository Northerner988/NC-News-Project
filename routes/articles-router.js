const router = require("express").Router();

const {
  getAllArticles,
  getCommentsById,
  getArticleById,
  postCommentById,
  patchArticlesVotes,
  deleteArticleById,
} = require("../controllers/articles.controller");

router.get("/", getAllArticles);

router.get("/:article_id", getArticleById);

router.get("/:article_id/comments", getCommentsById);

router.post("/:article_id/comments", postCommentById);

router.patch("/:article_id", patchArticlesVotes);

router.delete("/:article_id", deleteArticleById);

module.exports = router;
