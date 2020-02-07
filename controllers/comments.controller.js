const {
  fetchCommentsOnArticle,
  addCommentToArticle,
  updateComment,
  delComment
} = require("../models/comments.model");
const { fetchArticle } = require("../models/articles.model");

exports.getCommentsOnArticle = (req, res, next) => {
  const { sort_by, order, limit, p } = req.query;
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then(() => {
      return fetchCommentsOnArticle(article_id, sort_by, order, limit, p);
    })
    .then(({ total_count, comments }) => {
      res.status(200).send({ total_count, comments });
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

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const {
    body: { inc_votes }
  } = req;
  updateComment(comment_id, inc_votes)
    .then(comment => {
      res.status(200).send({ comment });
    })
    .catch(err => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  delComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(err => {
      next(err);
    });
};
