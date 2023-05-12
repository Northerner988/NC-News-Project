const express = require("express");
const { getAllTopics } = require("./controllers/topics.controller");
const {
  getCommentsById,
  getAllArticles,
  getArticleById,
} = require("./controllers/articles.controller");

const getAllEndpoints = require("./controllers/api-endpoints-controller");
const app = express();

const { postCommentById } = require("./controllers/comments.controller");
const e = require("express");

app.use(express.json());

app.get("/api", getAllEndpoints);

app.get("/api/topics", getAllTopics);

app.get("/api/articles", getAllArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsById);

app.post("/api/articles/:article_id/comments", postCommentById);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request - ID is invalid" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Invalid post body" });
  } else if (err.code === "23503") {
    if (err.constraint === "comments_author_fkey") {
      res.status(404).send({ msg: "Username not found" });
    } else if (err.constraint === "comments_article_id_fkey") {
      res.status(404).send({ msg: "Article ID not found" });
    }
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
