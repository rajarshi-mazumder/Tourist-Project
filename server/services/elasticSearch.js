const { Client } = require("@elastic/elasticsearch");

// const elasticClient = new Client({
//   node: "http://localhost:9200", // Change this if using a cloud instance
// });

const elasticClient = new Client({
  node:
    process.env.ELASTICSEARCH_URL ||
    "https://b0a9deba23344973a3c4c1ed3ba56f6b.asia-northeast1.gcp.cloud.es.io:443",
  auth: {
    apiKey: "VzFUQ3FaVUJQV2FIX2xmNm1feU06ZFpQSlpfRXJTcUtDNnhScXI5N2MxQQ==", // Use the 'encoded' value
  },
});

module.exports = elasticClient;
