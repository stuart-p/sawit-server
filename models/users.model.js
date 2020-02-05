const database = require("../db/connection");

function fetchUserData(username) {
  return database
    .select("*")
    .from("users")
    .where("username", username)
    .then(user => {
      if (user.length === 0) {
        return Promise.reject({ status: 404, msg: "username not found" });
      } else return user[0];
    });
}

module.exports = { fetchUserData };
