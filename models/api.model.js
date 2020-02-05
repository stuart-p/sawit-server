const fs = require("fs");

function fetchTreeStructure() {
  return new Promise((resolve, reject) => {
    fs.readFile("./endpoints.json", "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
}

module.exports = { fetchTreeStructure };
