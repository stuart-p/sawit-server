const database = require("../db/connection");

function fetchTopics() {
  return database.select("*").from("topics");
}

function fetchTopicData(topicName) {
  return database
    .select("*")
    .from("topics")
    .where("slug", topicName)
    .then(topicArray => {
      if (topicArray.length === 0) {
        return Promise.reject({ status: 404, msg: "topic not found" });
      } else {
        return topicArray[0];
      }
    });
}

function addTopic(slug, description) {
  if (slug === undefined || description === undefined) {
    return Promise.reject({
      status: 400,
      msg: "bad request - incomplete data"
    });
  }
  const constructedTopic = {
    slug,
    description
  };
  return database
    .insert(constructedTopic)
    .into("topics")
    .returning("*")
    .then(topicArray => {
      return topicArray[0];
    });
}

module.exports = { fetchTopics, fetchTopicData, addTopic };
