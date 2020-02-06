const express = require("express");
const server = express();
const { apiRouter } = require("./routes/api.router");
const errorHandler = require("./errorHandler");

server.use(express.json());

server.use("/", errorHandler.unauthorisedMethod);
server.use("/api", apiRouter);

server.use(errorHandler.internalErrorHandler);
server.use(errorHandler.psqlError);
server.use(errorHandler.genericError);

module.exports = server;
