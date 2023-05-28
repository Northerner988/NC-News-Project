const { fetchAllTopics, insertTopic } = require("../models/topics.model");

exports.getAllTopics = (req, res, next) => {
  fetchAllTopics()
    .then((allTopics) => {
      res.status(200).send({ topics: allTopics });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postTopic = (req, res, next) => {
  const { slug, description } = req.body;
  insertTopic(slug, description)
    .then((newTopic) => res.status(201).send({ topic: newTopic }))
    .catch((err) => {
      next(err);
    });
};
