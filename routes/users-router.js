const router = require("express").Router();

const {
  getAllUsers,
  getUsersById,
} = require("../controllers/users.controller");

router.get("/", getAllUsers);
router.get("/:username", getUsersById);
module.exports = router;
