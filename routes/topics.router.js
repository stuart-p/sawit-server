const topicsRouter = require("express").Router();
const { getTopics } = require("../controllers/topics.controller");

topicsRouter
  .route("/")
  .get(getTopics)
  .all((req, res, next) => {
    next({ status: 405, msg: "method not allowed" });
  });

module.exports = { topicsRouter };
