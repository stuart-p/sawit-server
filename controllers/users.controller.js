const {
  fetchUserData,
  addUser,
  fetchAllUsers
} = require("../models/users.model");

exports.getAllUsers = (req, res, next) => {
  fetchAllUsers().then(users => {
    res.status(200).send({ users });
  });
};

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

exports.postUser = (req, res, next) => {
  const { body } = req;
  addUser(body.username, body.avatar_url, body.name)
    .then(user => {
      res.status(201).send({ user });
    })
    .catch(err => {
      next(err);
    });
};
