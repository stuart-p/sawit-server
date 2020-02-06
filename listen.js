const { PORT = 8080 } = process.env;

const server = require("./server");

server.listen(PORT, () => {
  console.log(`listening on ${PORT}...`);
});
