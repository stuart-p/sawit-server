const database = require("../db/connection");

function fetchCommentsOnArticle(article_id, sort_by, order) {
  if (sort_by === undefined) sort_by = "created_at";
  if (order === undefined) order = "desc";
  return database
    .select("comments_id", "votes", "created_at", "author", "body")
    .from("comments")
    .where("article_id", article_id)
    .orderBy(sort_by, order)
    .then(comments => {
      return comments;
    });
}

function addCommentToArticle(article_id, author, body) {
  if (author === undefined || body === undefined)
    return Promise.reject({
      status: 406,
      msg: "bad request - not enough data provided"
    });
  const constructedComment = {
    article_id,
    author,
    body
  };
  return database
    .insert(constructedComment)
    .into("comments")
    .returning("*")
    .then(postedComment => {
      return postedComment[0];
    });
}

module.exports = { fetchCommentsOnArticle, addCommentToArticle };
