const router = require("express").Router();
const topicsRouter = require("./topics-router");
const usersRouter = require("./users-router");
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const endpointsRouter = require("./endpoints-router");

router.use("/", endpointsRouter);
router.use("/topics", topicsRouter);
router.use("/users", usersRouter);
router.use("/articles", articlesRouter);
router.use("/comments", commentsRouter);

module.exports = router;
