const {
  topicData,
  articleData,
  commentData,
  userData
} = require("../data/index.js");

const { formatDates, formatComments, makeRefObj } = require("../utils/utils");

exports.seed = function(knex) {
  //ensure that database is properly migrated prior to seeding
  return knex.migrate
    .rollback()
    .then(() => {
      return knex.migrate.latest();
    })
    .then(() => {
      const topicsInsertions = knex("topics")
        .insert(topicData)
        .returning("*");
      const usersInsertions = knex("users")
        .insert(userData)
        .returning("*");
      return Promise.all([topicsInsertions, usersInsertions]);
    })
    .then(([topicRows, userRows]) => {
      const formattedData = formatDates(articleData);
      const articlesInsertions = knex("articles")
        .insert(formattedData)
        .returning("*");
      return Promise.all([articlesInsertions, topicRows, userRows]);
    })
    .then(([articleRows, topicRows, userRows]) => {
      // console.log(articleRows);
      const articleRef = makeRefObj(articleRows);
      console.log(articleRef);
      const formattedComments = formatComments(commentData, articleRef);
      return knex("comments")
        .insert(formattedComments)
        .returning("*");
      /*

    Your comment data is currently in the incorrect format and will violate your SQL schema.

    Keys need renaming, values need changing, and most annoyingly, your comments currently only refer to the title of the article they belong to, not the id.

    You will need to write and test the provided makeRefObj and formatComments utility functions to be able insert your comment data.
    */
    })
    .then(commentRows => {
      console.log(commentRows);
      console.log("all data imported into " + process.env.NODE_ENV);
    });
};
