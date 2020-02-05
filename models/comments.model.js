const database = require("../db/connection");

function fetchCommentsOnArticle(article_id, sort_by, order) {
  if (sort_by === undefined) sort_by = "created_at";
  if (order === undefined) order = "desc";
  if (order !== "asc" && order !== "desc") {
    return Promise.reject({
      status: 400,
      msg: "bad request - query incorrectly formatted"
    });
  }
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

function updateComment(comments_id, updatedVote) {
  if (updatedVote === undefined) {
    return Promise.reject({
      status: 406,
      msg: "bad request - not enough data provided"
    });
  }
  return database
    .select("*")
    .from("comments")
    .where("comments_id", comments_id)
    .increment("votes", updatedVote)
    .returning("*")
    .then(updatedComment => {
      if (updatedComment.length === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      } else {
        return updatedComment[0];
      }
    });
}

function delComment(comments_id) {
  return database
    .delete()
    .from("comments")
    .where("comments_id", comments_id)
    .then(numDeleted => {
      if (numDeleted === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      }
    });
}

module.exports = {
  fetchCommentsOnArticle,
  addCommentToArticle,
  updateComment,
  delComment
};
