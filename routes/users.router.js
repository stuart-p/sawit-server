const usersRouter = require("express").Router();
const {
  getUserData,
  postUser,
  getAllUsers
} = require("../controllers/users.controller");
const errorHandler = require("../errorHandler");

usersRouter
  .route("/")
  .get(getAllUsers)
  .post(postUser)
  .all(errorHandler.unauthorisedMethod);

usersRouter
  .route("/:username")
  .get(getUserData)
  .all(errorHandler.unauthorisedMethod);

module.exports = { usersRouter };
