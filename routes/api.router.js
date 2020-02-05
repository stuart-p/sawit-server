const apiRouter = require("express").Router();
const { topicsRouter } = require("./topics.router");
const { usersRouter } = require("./users.router");
const { articlesRouter } = require("./articles.router");
const { commentsRouter } = require("./comments.router");

const { getTree } = require("../controllers/api.controller");
const errorHandler = require("../errorHandler");

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);

apiRouter
  .route("/")
  .get(getTree)
  .all(errorHandler.unauthorisedMethod);

module.exports = { apiRouter };
