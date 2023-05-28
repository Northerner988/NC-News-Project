const {
  fetchArticleById,
  fetchCommentsById,
  fetchAllArticles,
  updateArticlesVotes,
  insertCommentById,
  removeArticleById,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  fetchArticleById(article_id)
    .then((specifiedArticle) => {
      res.status(200).send({ article: specifiedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const { sort_by, topic, order } = req.query;
  fetchAllArticles(sort_by, topic, order)
    .then((allArticles) => {
      res.status(200).send({ articles: allArticles });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params;

  fetchCommentsById(article_id)
    .then((comments) => {
      res.status(200).send({ comments: comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentById = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return insertCommentById(article_id, username, body)
    .then((newComment) => res.status(201).send({ comment: newComment }))
    .catch((err) => {
      next(err);
    });
};

exports.patchArticlesVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticlesVotes(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ article: updatedArticle });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteArticleById = (req, res, next) => {
  const { article_id } = req.params;
  return removeArticleById(article_id)
    .then(() => res.status(204).send())
    .catch((err) => {
      next(err);
    });
};
