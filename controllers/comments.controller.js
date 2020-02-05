const {
  fetchCommentsOnArticle,
  addCommentToArticle,
  updateComment,
  delComment
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
    .then(comments => {
      res.status(201).send({ comments });
    })
    .catch(err => {
      next(err);
    });
};

exports.patchComment = (req, res, next) => {
  const { comments_id } = req.params;
  const {
    body: { inc_votes }
  } = req;
  updateComment(comments_id, inc_votes)
    .then(comments => {
      res.status(200).send({ comments });
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comments_id } = req.params;
  delComment(comments_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(err => {
      next(err);
    });
};