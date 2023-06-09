const db = require("../db/connection");
const { checkCommentExists } = require("../db/seeds/utils");

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

exports.updateCommentById = (comment_id, inc_votes) => {
  return checkCommentExists(comment_id)
    .then(() => {
      return db.query(
        `UPDATE comments
        SET votes = votes + $1
        WHERE comment_id = $2 RETURNING *;`,
        [inc_votes, comment_id]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};
