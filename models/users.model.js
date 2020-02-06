const database = require("../db/connection");

function fetchUserData(username) {
  return database
    .select("*")
    .from("users")
    .where("username", username)
    .then(userArray => {
      if (userArray.length === 0) {
        return Promise.reject({ status: 404, msg: "username not found" });
      } else return userArray[0];
    });
}

module.exports = { fetchUserData };
