const database = require("../db/connection");

function fetchCommentsOnArticle(article_id) {
  return database
    .select("*")
    .from("comments")
    .where("article_id", article_id)
    .then(comments => {
      comments.forEach(comment => {
        delete comment.article_id;
      });
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
