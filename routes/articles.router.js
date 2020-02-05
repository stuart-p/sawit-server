const articlesRouter = require("express").Router();
const {
  getArticle,
  patchArticle,
  getAllArticles
} = require("../controllers/articles.controller");
const {
  getCommentsOnArticle,
  postCommentToArticle
} = require("../controllers/comments.controller");
const errorHandler = require("../errorHandler");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .all(errorHandler.unauthorisedMethod);

articlesRouter
  .route("/:article_id")
  .get(getArticle)
  .patch(patchArticle)
  .all(errorHandler.unauthorisedMethod);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsOnArticle)
  .post(postCommentToArticle)
  .all(errorHandler.unauthorisedMethod);

module.exports = { articlesRouter };
