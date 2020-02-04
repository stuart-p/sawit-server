const {
  fetchCommentsOnArticle,
  addCommentToArticle
} = require("../models/comments.model");
const { fetchArticle } = require("../models/articles.model");

exports.getCommentsOnArticle = (req, res, next) => {
  const { sort_by, order } = req.query;
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then(() => {
      return fetchCommentsOnArticle(article_id, sort_by, order);
    })
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(err => {
      next(err);
    });
};

exports.postCommentToArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { body } = req;

  addCommentToArticle(article_id, body.username, body.body)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(err => {
      next(err);
    });
};
