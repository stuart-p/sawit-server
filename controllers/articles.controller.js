const {
  fetchArticle,
  fetchAllArticles,
  updateArticle
} = require("../models/articles.model");

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then(article => {
      res.status(200).send({ article });
    })
    .catch(err => {
      next(err);
    });
};

exports.getAllArticles = (req, res, next) => {
  fetchAllArticles().then(articles => {
    res.status(200).send({ articles });
  });
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const {
    body: { inc_votes }
  } = req;
  updateArticle(article_id, inc_votes)
    .then(updatedArticle => {
      res.status(200).send({ updatedArticle });
    })
    .catch(err => {
      next(err);
    });
};
