const { fetchUserData } = require("../models/users.model");

exports.getUserData = (req, res, next) => {
  const { username } = req.params;
  fetchUserData(username)
    .then(user => {
      res.status(200).send({ user });
    })
    .catch(err => {
      next(err);
    });
};
