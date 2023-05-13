const {
  insertCommentById,
  removeCommentById,
} = require("../models/comments.model");

exports.postCommentById = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return insertCommentById(article_id, username, body)
    .then((newComment) => res.status(201).send({ comment: newComment }))
    .catch((err) => {
      next(err);
    });
};

exports.deleteCommentById = (req, res, next) => {
  const { comment_id } = req.params;
  return removeCommentById(comment_id)
    .then(() => res.status(204).send())
    .catch((err) => {
      next(err);
    });
};
