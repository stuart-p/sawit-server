const database = require("../db/connection");
// const {fetchUserData} = require('../models/users.model')

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

function fetchAllArticles(sort_by, order, author, topic) {
  if (sort_by === undefined) sort_by = "created_at";
  if (order === undefined) order = "desc";
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "bad request - query incorrectly formatted"
    });
  }

  return database
    .select(
      "articles.author",
      "articles.title",
      "articles.article_id",
      "articles.topic",
      "articles.created_at",
      "articles.votes"
    )
    .from("articles")
    .leftJoin("comments", "articles.article_id", "=", "comments.article_id")
    .count("*", { as: "comment_count" })
    .groupBy("articles.article_id")
    .orderBy(sort_by, order)
    .modify(query => {
      if (author !== undefined) {
        query.where("articles.author", author);
      }
    })
    .modify(query => {
      if (topic !== undefined) {
        query.where("articles.topic", topic);
      }
    })
    .then(articles => {
      articles.forEach(article => {
        article.comment_count = parseInt(article.comment_count);
      });
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
