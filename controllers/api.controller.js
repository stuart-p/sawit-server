const { fetchTreeStructure } = require("../models/api.model");

exports.getTree = (req, res, next) => {
  fetchTreeStructure()
    .then(endpoints => {
      res.status(200).send({ endpoints });
    })
    .catch(err => {
      next(err);
    });
};
