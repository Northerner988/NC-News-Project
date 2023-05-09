const { fetchAllTopics } = require("../models/topics.model");

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((allTopics) => {
      res.status(200).send({ topics: allTopics });
    })
    .catch((err) => {
      next(err);
    });
};
