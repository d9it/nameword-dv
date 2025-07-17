const axios = require("axios");
const { Logger } = require('../../../logger');

const createAxiosInstance = () => {
  return axios.create({});
};

module.exports = createAxiosInstance;