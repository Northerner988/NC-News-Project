const db = require("../db/connection");

const { checkArticleExists } = require("../db/seeds/utils");

exports.fetchArticleById = (articleId) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [articleId])
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "ID not found",
        });
      }
      return result.rows[0];
    });
};

exports.fetchCommentsById = (article_id) => {
  return checkArticleExists(article_id)
    .then(() => {
      return db.query(
        `SELECT * FROM comments WHERE article_id = $1
    ORDER BY created_at DESC; `,
        [article_id]
      );
    })
    .then((result) => {
      return result.rows;
    });
};
