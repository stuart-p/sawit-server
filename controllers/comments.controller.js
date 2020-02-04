const {
  fetchCommentsOnArticle,
  addCommentToArticle
} = require("../models/comments.model");

exports.getCommentsOnArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchCommentsOnArticle(article_id).then(comments => {
    res.status(200).send({ comments });
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
