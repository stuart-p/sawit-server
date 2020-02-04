const { fetchTopics } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  fetchTopics()
    .then(topicsArray => {
      res.status(200).send({ topics: topicsArray });
    })
    .catch(err => {
      next(err);
    });
};
