const articlesRouter = require("express").Router();
const {
  getArticle,
  patchArticle,
  getAllArticles,
  postArticle,
  deleteArticle
} = require("../controllers/articles.controller");
const {
  getCommentsOnArticle,
  postCommentToArticle
} = require("../controllers/comments.controller");
const errorHandler = require("../errorHandler");

articlesRouter
  .route("/")
  .get(getAllArticles)
  .post(postArticle)
  .all(errorHandler.unauthorisedMethod);

articlesRouter
  .route("/:article_id")
  .get(getArticle)
  .patch(patchArticle)
  .delete(deleteArticle)
  .all(errorHandler.unauthorisedMethod);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsOnArticle)
  .post(postCommentToArticle)
  .all(errorHandler.unauthorisedMethod);

module.exports = { articlesRouter };
