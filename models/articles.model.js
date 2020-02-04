const database = require("../db/connection");

function fetchArticle(article_id) {
  return database
    .select("*")
    .from("articles")
    .where("article_id", article_id)
    .then(article => {
      if (article.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      } else {
        return Promise.all([
          article[0],
          database("comments")
            .where("article_id", article[0].article_id)
            .count("*")
        ]);
      }
    })
    .then(([article, [commentCount]]) => {
      article.comment_count = parseInt(commentCount.count);
      return article;
    });
}

function fetchAllArticles() {
  return database
    .select("author", "title", "article_id", "topic", "created_at", "votes")
    .from("articles")
    .then(articles => {
      return articles;
    });
}

function updateArticle(articleToUpdate, votesToUpdate) {
  if (votesToUpdate === undefined) {
    return Promise.reject({
      status: 406,
      msg: "bad request - not enough data provided"
    });
  }
  return database
    .select("*")
    .from("articles")
    .where("article_id", articleToUpdate)
    .increment("votes", votesToUpdate)
    .returning("*")
    .then(updatedArticle => {
      if (updatedArticle.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      } else {
        return updatedArticle[0];
      }
    });
}

module.exports = { fetchArticle, fetchAllArticles, updateArticle };
