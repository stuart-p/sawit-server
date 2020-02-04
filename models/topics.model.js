const database = require("../db/connection");

function fetchTopics() {
  return database
    .select("*")
    .from("topics")
    .then(topics => {
      return topics;
    });
}

module.exports = { fetchTopics };
