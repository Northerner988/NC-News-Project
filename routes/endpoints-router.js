const router = require("express").Router();

const getAllEndpoints = require("../controllers/api-endpoints-controller");

router.get("/", getAllEndpoints);

module.exports = router;
