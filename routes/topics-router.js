const router = require("express").Router();

const { getAllTopics, postTopic } = require("../controllers/topics.controller");

router.get("/", getAllTopics);
router.post("/", postTopic);

module.exports = router;
