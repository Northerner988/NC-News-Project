const express = require("express");
const { getAllTopics } = require("./controllers/topics.controller");
const { getArticleById } = require("./controllers/articles.controller");
const getAllEndpoints = require("./controllers/api-endpoints-controller");
const app = express();

app.get("/api/topics", getAllTopics);

app.get("/api/articles/:article_id", getArticleById);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request - ID is invalid" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status).send({ msg: err.msg });
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
