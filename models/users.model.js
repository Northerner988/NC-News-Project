const db = require("../db/connection");

const { checkUserExists } = require("../db/seeds/utils");

exports.fetchAllUsers = () => {
  return db
    .query(
      `
    SELECT * FROM users;`
    )
    .then((result) => {
      return result.rows;
    });
};

exports.fetchUserById = (username) => {
  return checkUserExists(username)
    .then(() => {
      return db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    })
    .then((result) => {
      return result.rows[0];
    });
};
