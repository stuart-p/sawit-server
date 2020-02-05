const { fetchTreeStructure } = require("../models/api.model");

exports.getTree = (req, res, next) => {
  fetchTreeStructure();
};
