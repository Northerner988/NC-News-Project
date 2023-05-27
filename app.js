const express = require("express");
const apiRouter = require("./routes/api-router");
const app = express();
app.use(express.json());

app.use("/api", apiRouter);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request - invalid data type" });
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
