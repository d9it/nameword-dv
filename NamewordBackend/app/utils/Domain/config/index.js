require("dotenv").config();
const { Logger } = require('../../../logger');

const config = {
  openprovider: {
    apiUrl: "https://api.openprovider.eu/v1beta",
    username: process.env.OPENPROVIDER_USERNAME,
    password: process.env.OPENPROVIDER_PASSWORD,
  },
  connectreseller: {
    apiUrl: "https://api.connectreseller.com/ConnectReseller/ESHOP/",
    apiKey: process.env.CONNECTSELLER_API_KEY,
  },
  price_diffrence_threshold: 3
};

// Validate ConnectReseller API Key
if (!config.connectreseller.apiKey) {
  Logger.error(
    "ConnectReseller API key is missing. Please set CONNECTSELLER_API_KEY in your environment variables."
  );
  throw new Error("ConnectReseller API key is missing.");
}


module.exports = config;