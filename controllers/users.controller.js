const { fetchAllUsers } = require("../models/users.model");

exports.getAllUsers = (req, res, next) => {
  fetchAllUsers()
    .then((allUsers) => {
      res.status(200).send({ users: allUsers });
    })
    .catch((err) => {
      next(err);
    });
};
