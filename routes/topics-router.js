const router = require("express").Router();

const { getAllTopics } = require("../controllers/topics.controller");

router.get("/", getAllTopics);

module.exports = router;
