const db = require("../db/connection");
const format = require("pg-format");
const { checkArticleExists } = require("./articles.model");

const { checkCommentExists } = require("../db/seeds/utils");

// exports.insertCommentById = (article_id, username, body) => {
//   const queryStr = format(
//     `INSERT INTO comments (article_id, author, body)
//       VALUES (%L, %L, %L) RETURNING *;`,
//     article_id,
//     username,
//     body
//   );

//   return checkArticleExists(article_id)
//     .then(() => {
//       return db.query(queryStr);
//     })
//     .then((result) => {
//       return result.rows[0];
//     });
// };

// exports.insertCommentById = (article_id, username, body) => {
//   return checkArticleExists(article_id).then(() => {
//     const queryStr = format(
//       `INSERT INTO comments (article_id, author, body)
//       VALUES (%L) RETURNING *;`,
//       [article_id, username, body]
//     );
//     return db.query(queryStr).then((result) => {
//       return result.rows[0];
//     });
//   });
// };

// exports.insertCommentById = (article_id, username, body) => {
//   return checkArticleExists(article_id).then(() => {
//     const queryStr = `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`;

//     const queryValues = [article_id, username, body];

//     return db.query(queryStr, queryValues).then((result) => {
//       return result.rows[0];
//     });
//   });
// };
exports.insertCommentById = (article_id, username, body) => {
  if (!username || !body || typeof body !== "string") {
    return Promise.reject({
      status: 400,
      msg: "Invalid post body",
    });
  }
  const queryStr = `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`;

  const queryValues = [article_id, username, body];

  return db.query(queryStr, queryValues).then((result) => {
    return result.rows[0];
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
