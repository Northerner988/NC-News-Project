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

exports.fetchAllArticles = () => {
  return db
    .query(
      `SELECT 
  articles.article_id, 
  articles.title, 
  articles.author, 
  articles.topic, 
  articles.created_at, 
  articles.votes, 
  articles.article_img_url, 
  CAST(COUNT(comments.comment_id) AS INT) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC;`
    )
    .then((result) => {
      return result.rows;
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

exports.updateArticlesVotes = (article_id, inc_votes) => {
  return checkArticleExists(article_id)
    .then(() => {
      return db.query(
        `UPDATE articles 
        SET votes = votes + $1 
        WHERE article_id = $2 RETURNING *;`,
        [inc_votes, article_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};
