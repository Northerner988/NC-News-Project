const express = require("express");
const { getAllTopics } = require("./controllers/topics.controller");
const getAllEndpoints = require("./controllers/api-endpoints-controller");
const app = express();

app.use(express.json());

app.get("/api/topics", getAllTopics);
app.get("/api", getAllEndpoints);

module.exports = app;
