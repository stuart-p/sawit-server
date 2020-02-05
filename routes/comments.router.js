const commentsRouter = require("express").Router();
const {
  patchComment,
  deleteComment
} = require("../controllers/comments.controller");
const errorHandler = require("../errorHandler");

commentsRouter
  .route("/:comments_id")
  .patch(patchComment)
  .delete(deleteComment)
  .all(errorHandler.unauthorisedMethod);

module.exports = { commentsRouter };
