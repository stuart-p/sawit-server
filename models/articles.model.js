const database = require("../db/connection");

function fetchArticle(article_id) {
  return database
    .select(
      "articles.author",
      "articles.title",
      "articles.article_id",
      "articles.body",
      "articles.topic",
      "articles.created_at",
      "articles.votes"
    )
    .from("articles")
    .leftJoin("comments", "articles.article_id", "=", "comments.article_id")
    .count("*", { as: "comment_count" })
    .groupBy("articles.article_id")
    .where("articles.article_id", article_id)
    .then(articleArray => {
      if (articleArray.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      } else {
        articleArray[0].comment_count = parseInt(articleArray[0].comment_count);
        return articleArray[0];
      }
    });
}

function fetchAllArticles(
  sort_by = "created_at",
  order = "desc",
  author,
  topic,
  limit = 10,
  p = 1
) {
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "bad request - query incorrectly formatted"
    });
  }
  if (isNaN(p) || isNaN(limit)) {
    return Promise.reject({ status: 400, msg: "bad request" });
  }
  if (p <= 0) {
    return Promise.reject({
      status: 400,
      msg: "bad request - invalid page number"
    });
  }
  if (limit <= 0) {
    return Promise.reject({
      status: 400,
      msg: "bad request - invalid page limit"
    });
  }
  const articleData = database
    .select(
      "articles.author",
      "articles.title",
      "articles.article_id",
      "articles.topic",
      "articles.created_at",
      "articles.votes"
    )
    .from("articles")
    .modify(query => {
      if (author !== undefined) {
        query.where("articles.author", author);
      }
    })
    .modify(query => {
      if (topic !== undefined) {
        query.where("articles.topic", topic);
      }
    });
  return Promise.all([
    articleData.clone(),
    articleData
      .clone()
      .leftJoin("comments", "articles.article_id", "=", "comments.article_id")
      .count("*", { as: "comment_count" })
      .groupBy("articles.article_id")
      .orderBy(sort_by, order)
      .limit(limit)
      .offset((p - 1) * limit)
  ]).then(([allMatches, articles]) => {
    const total_count = allMatches.length;
    articles.forEach(article => {
      article.comment_count = parseInt(article.comment_count);
    });
    return { total_count, articles };
  });
}

function updateArticle(articleToUpdate, votesToUpdate) {
  if (votesToUpdate === undefined) {
    return fetchArticle(articleToUpdate);
  }
  return database
    .select("*")
    .from("articles")
    .where("article_id", articleToUpdate)
    .increment("votes", votesToUpdate)
    .returning("*")
    .then(updatedArticleArray => {
      if (updatedArticleArray.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      } else {
        return updatedArticleArray[0];
      }
    });
}

function createArticle(title, body, author, topic) {
  if (
    title === undefined ||
    body === undefined ||
    author === undefined ||
    topic === undefined
  ) {
    return Promise.reject({
      status: 400,
      msg: "bad request - not enough data provided"
    });
  }
  const constructedArticle = {
    title,
    body,
    author,
    topic
  };
  return database
    .insert(constructedArticle)
    .into("articles")
    .returning("*")
    .then(postedArticleArray => {
      return postedArticleArray[0];
    });
}

function delArticle(article_id) {
  return database
    .delete()
    .from("articles")
    .where("article_id", article_id)
    .then(numDeleted => {
      if (numDeleted === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
    });
}

module.exports = {
  fetchArticle,
  fetchAllArticles,
  updateArticle,
  createArticle,
  delArticle
};
