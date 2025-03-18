const { Client } = require("@elastic/elasticsearch");

const elasticClient = new Client({
  node: "http://localhost:9200", // Change this if using a cloud instance
});

module.exports = elasticClient;
