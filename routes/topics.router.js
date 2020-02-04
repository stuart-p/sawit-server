const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics.controller");
const errorHandler = require("../errorHandler");

topicsRouter
  .route("/")
  .get(getTopics)
  .all(errorHandler.unauthorisedMethod);

module.exports = { topicsRouter };
