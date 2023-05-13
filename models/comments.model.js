const db = require("../db/connection");
const format = require("pg-format");
const { checkArticleExists } = require("./articles.model");

const { checkCommentExists } = require("../db/seeds/utils");

exports.insertCommentById = (article_id, username, body) => {
  return checkArticleExists(article_id).then(() => {
    return db
      .query(
        `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`,
        [article_id, username, body]
      )
      .then((result) => {
        return result.rows[0];
      });
  });
};

exports.removeCommentById = (comment_id) => {
  return checkCommentExists(comment_id).then(() => {
    return db.query(
      `
    DELETE FROM comments WHERE comment_id = $1
    `,
      [comment_id]
    );
  });
};
