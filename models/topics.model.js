const db = require("../db/connection");

exports.fetchAllTopics = () => {
  return db.query(`SELECT * FROM topics;`).then((result) => {
    return result.rows;
  });
};

exports.insertTopic = (slug, description) => {
  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: "Missing required fields",
    });
  }

  return db
    .query(
      `
      INSERT INTO topics
      (slug, description)
      VALUES
      ($1, $2)
      RETURNING *`,
      [slug, description]
    )
    .then((result) => result.rows[0]);
};
