const allEndpoints = require("../endpoints.json");

const getAllEndpoints = (req, res, next) => {
  res.status(200).send({ endpoints: allEndpoints });
};

module.exports = getAllEndpoints;
