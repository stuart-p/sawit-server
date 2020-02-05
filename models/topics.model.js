const database = require("../db/connection");

function fetchTopics() {
  return database
    .select("*")
    .from("topics")
    .then(topics => {
      return topics;
    });
}

function fetchTopicData(topicName) {
  return database
    .select("*")
    .from("topics")
    .where("slug", topicName)
    .then(topic => {
      if (topic.length === 0) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      } else {
        return topic[0];
      }
    });
}

module.exports = { fetchTopics, fetchTopicData };
