const database = require("../db/connection");

function fetchArticle(article_id) {
  return database
    .select("*")
    .from("articles")
    .where("article_id", article_id)
    .then(article => {
      if (article.length === 0)
        return Promise.reject({ status: 404, msg: "article not found" });
      return article[0];
    });
}

module.exports = { fetchArticle };
