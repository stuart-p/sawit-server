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

function addUser(username, avatar_url, name) {
  if (
    username === undefined ||
    avatar_url === undefined ||
    name === undefined
  ) {
    return Promise.reject({
      status: 400,
      msg: "bad request - incomplete information"
    });
  }
  const constructedUser = {
    username,
    avatar_url,
    name
  };
  return database
    .insert(constructedUser)
    .into("users")
    .returning("*")
    .then(userArray => {
      return userArray[0];
    });
}

function fetchAllUsers() {
  return database.select("*").from("users");
}

module.exports = { fetchUserData, addUser, fetchAllUsers };
