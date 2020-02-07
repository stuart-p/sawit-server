const topicsRouter = require("express").Router();
const { getTopics, postTopic } = require("../controllers/topics.controller");
const errorHandler = require("../errorHandler");

topicsRouter
  .route("/")
  .get(getTopics)
  .post(postTopic)
  .all(errorHandler.unauthorisedMethod);

module.exports = { topicsRouter };
