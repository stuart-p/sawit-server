const { fetchTopics, addTopic } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then(topicsArray => {
      res.status(200).send({ topics: topicsArray });
    })
    .catch(err => {
      next(err);
    });
};

exports.postTopic = (req, res, next) => {
  const { body } = req;
  addTopic(body.slug, body.description)
    .then(topic => {
      res.status(201).send({ topic });
    })
    .catch(err => {
      next(err);
    });
};
