const axios = require("axios");
const { Builder, parseStringPromise } = require('xml2js');
const { Logger } = require('./logger');

const axiosInstance = axios.create({
	baseURL: process.env.PLESK_SERVER_URL,
	headers: {
		'Content-Type': 'text/xml',
		'HTTP_AUTH_LOGIN': process.env.PLESK_LOGIN,
		'HTTP_AUTH_PASSWD': process.env.PLESK_PASSWORD,
	}
});

module.exports.request = async (data) => {
	const xmlRequestBody = new Builder().buildObject(data);

	const response = await axiosInstance.post('', xmlRequestBody);

	Logger.info(response.data);

	return await parseStringPromise(response.data, { explicitArray: false });
}