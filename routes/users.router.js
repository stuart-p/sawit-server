const usersRouter = require("express").Router();
const { getUserData } = require("../controllers/users.controller");
const errorHandler = require("../errorHandler");

usersRouter.route("/").all(errorHandler.unauthorisedMethod);

usersRouter
  .route("/:username")
  .get(getUserData)
  .all(errorHandler.unauthorisedMethod);

module.exports = { usersRouter };
