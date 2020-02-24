const database = require("../db/connection");

function fetchComment(comment_id) {
  return database
    .select(
      "comments.comment_id",
      "comments.author",
      "comments.article_id",
      "comments.votes",
      "comments.created_at",
      "comments.body"
    )
    .from("comments")
    .where("comments.comment_id", comment_id)
    .then(commentArray => {
      if (commentArray.length === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      } else {
        return commentArray[0];
      }
    });
}

function fetchCommentsOnArticle(
  article_id,
  sort_by = "created_at",
  order = "desc",
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
  const commentData = database
    .select("comment_id", "votes", "created_at", "author", "body")
    .from("comments")
    .where("article_id", article_id)
    .orderBy(sort_by, order);

  return Promise.all([
    commentData.clone(),
    commentData
      .clone()
      .limit(limit)
      .offset((p - 1) * limit)
  ]).then(([allMatches, comments]) => {
    const total_count = allMatches.length;
    return { total_count, comments };
  });
}

function addCommentToArticle(article_id, author, body) {
  if (author === undefined || body === undefined)
    return Promise.reject({
      status: 400,
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
    .then(postedCommentArray => {
      return postedCommentArray[0];
    });
}

function updateComment(comment_id, updatedVote) {
  if (updatedVote === undefined) {
    return fetchComment(comment_id);
  }
  return database
    .select("*")
    .from("comments")
    .where("comment_id", comment_id)
    .increment("votes", updatedVote)
    .returning("*")
    .then(updatedCommentArray => {
      if (updatedCommentArray.length === 0) {
        return Promise.reject({ status: 404, msg: "comment not found" });
      } else {
        return updatedCommentArray[0];
      }
    });
}

function delComment(comment_id) {
  return database
    .delete()
    .from("comments")
    .where("comment_id", comment_id)
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
