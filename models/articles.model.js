const db = require("../db/connection");

const { checkArticleExists } = require("../db/seeds/utils");

exports.fetchArticleById = (article_Id) => {
  return db
    .query(
      `SELECT
    articles.*,
    CAST(COUNT(comments.comment_id) AS INT) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
      [article_Id]
    )
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

exports.fetchAllArticles = (sort_by = "created_at", topic, order = "desc") => {
  const validSortBy = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "comment_count",
  ];

  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid query",
    });
  }

  let sqlStr = `SELECT
    articles.article_id,
    articles.title,
    articles.author,
    articles.topic,
    articles.created_at,
    articles.votes,
    articles.article_img_url,
    CAST(COUNT(comments.comment_id) AS INT) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id`;

  const queryParams = [];

  if (topic) {
    sqlStr += ` WHERE articles.topic = $1`;
    queryParams.push(topic);
  }

  sqlStr += ` GROUP BY articles.article_id`;

  if (sort_by) {
    sqlStr += ` ORDER BY ${sort_by}`;
  }

  if (order === "asc" || order === "desc") {
    sqlStr += ` ${order.toUpperCase()};`;
  }

  return db.query(sqlStr, queryParams).then((result) => {
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
