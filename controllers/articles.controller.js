const {
  fetchArticle,
  fetchAllArticles,
  updateArticle,
  createArticle,
  delArticle
} = require("../models/articles.model");

const { fetchUserData } = require("../models/users.model");
const { fetchTopicData } = require("../models/topics.model");

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  const { sort_by, order, author, topic, limit, p } = req.query;
  let filterByAuthor;
  let filterBytopic;
  if (author !== undefined) {
    filterByAuthor = fetchUserData(author);
  }
  if (topic !== undefined) {
    filterBytopic = fetchTopicData(topic);
  }
  return Promise.all([filterByAuthor, filterBytopic])
    .then(([validUser, validTopic]) => {
      return fetchAllArticles(sort_by, order, author, topic, limit, p);
    })
    .then(({ total_count, articles }) => {
      res.status(200).send({ total_count, articles });
    })
    .catch(err => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const {
    body: { inc_votes }
  } = req;
  updateArticle(article_id, inc_votes)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.postArticle = (req, res, next) => {
  const { body } = req;
  createArticle(body.title, body.body, body.author, body.topic)
    .then(article => {
      res.status(201).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  delArticle(article_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(err => {
      next(err);
    });
};
