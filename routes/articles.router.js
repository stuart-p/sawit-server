const articlesRouter = require("express").Router();
const {
  getArticle,
  patchArticle
} = require("../controllers/articles.controller");
const {
  getCommentsOnArticle,
  postCommentToArticle
} = require("../controllers/comments.controller");

articlesRouter
  .route("/:article_id")
  .get(getArticle)
  .patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsOnArticle)
  .post(postCommentToArticle);

module.exports = { articlesRouter };
