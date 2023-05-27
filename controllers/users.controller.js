const { fetchAllUsers, fetchUserById } = require("../models/users.model");

exports.getAllUsers = (req, res, next) => {
  fetchAllUsers()
    .then((allUsers) => {
      res.status(200).send({ users: allUsers });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsersById = (req, res, next) => {
  const { username } = req.params;
  fetchUserById(username)
    .then((user) => {
      res.status(200).send({ users: user });
    })
    .catch((err) => {
      next(err);
    });
};
