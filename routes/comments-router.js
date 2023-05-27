const router = require("express").Router();

const {
  deleteCommentById,
  patchCommentById,
} = require("../controllers/comments.controller");

router.patch("/:comment_id", patchCommentById);
router.delete("/:comment_id", deleteCommentById);

module.exports = router;
