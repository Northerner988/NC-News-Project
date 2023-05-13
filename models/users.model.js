const db = require("../db/connection");

exports.fetchAllUsers = (users) => {
  return db
    .query(
      `
    SELECT * FROM users;`
    )
    .then((result) => {
      return result.rows;
    });
};
