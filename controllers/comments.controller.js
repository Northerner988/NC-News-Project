const { insertCommentById } = require("../models/comments.model");

exports.postCommentById = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return insertCommentById(article_id, username, body)
    .then((comment) => res.status(201).send({ comment }))
    .catch((err) => {
      next(err);
    });
};
