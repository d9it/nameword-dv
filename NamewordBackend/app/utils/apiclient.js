const axios = require("axios");
const dotenv = require("dotenv");
const ServiceUnavailableError = require("../errors/ServiceUnavailableError");
const { Logger } = require('./logger');

dotenv.config();

const API_URL = "https://api.connectreseller.com/ConnectReseller/ESHOP/";
const API_KEY = process.env.CONNECTSELLER_API_KEY;

if (!API_KEY) {
	Logger.error(
		"API key is missing. Please set CONNECTSELLER_API_KEY in your environment variables."
	);
	throw new Error(
		"API key is missing. Please set CONNECTSELLER_API_KEY in your environment variables."
	);
}

module.exports.get = async (type, params) => {
	try {
		Logger.info(`Fetching data from ${type}...`);
		Logger.info(`Request parameters: ${JSON.stringify(params.params)}`);
		const response = await axios.get(`${API_URL}${type}`, {
			headers: {
				"Content-Type": "application/json",
			},
			params: {
				APIKey: API_KEY,
				...params,
			},
		});
		return response.data;
	} catch (error) {
		const ErrorHandler = require('./errorHandler');
		
		// Log error with context
		ErrorHandler.logError(error, {
			type: 'api_client_error',
			apiUrl: API_URL,
			requestType: type,
			params: JSON.stringify(params)
		});

		// Create specific error messages based on error type
		if (error.response) {
			const enhancedError = ErrorHandler.enhanceError(error, {
				type: 'api_response_error',
				statusCode: error.response.status,
				responseData: error.response.data
			});
			throw new Error(
				`API request failed with status ${error.response.data.statusCode}: ${error.response.data.responseText}`,
				{ cause: enhancedError }
			);
		} else if (error.request) {
			const enhancedError = ErrorHandler.enhanceError(error, {
				type: 'api_request_error',
				requestData: error.request
			});
			throw new Error("API request failed: No response received", { cause: enhancedError });
		} else {
			const enhancedError = ErrorHandler.enhanceError(error, {
				type: 'api_general_error'
			});
			throw new Error(`API request failed: ${error.message}`, { cause: enhancedError });
		}
	}
};

module.exports.request = async (type, params, method = "get") => {
	try {
		const response = await axios.get(`${API_URL}${type}`, {
			headers: {
				"Content-Type": "application/json",
			},
			params: {
				APIKey: API_KEY,
				...params,
			},
		});
		return response.data;
	} catch (error) {
		const ErrorHandler = require('./errorHandler');
		
		// Log error with context
		ErrorHandler.logError(error, {
			type: 'api_request_error',
			apiUrl: API_URL,
			requestType: type,
			method: method,
			params: JSON.stringify(params)
		});

		// Handle different types of errors with proper context
		if (error.response) {
			const enhancedError = ErrorHandler.enhanceError(error, {
				type: 'api_response_error',
				statusCode: error.response.status,
				responseData: error.response.data
			});
			throw new Error(
				error.response.data.statusText ||
					error.response.statusText ||
					"API request failed",
				{ cause: enhancedError }
			);
		} else if (error.request) {
			const enhancedError = ErrorHandler.enhanceError(error, {
				type: 'api_no_response_error',
				requestData: error.request
			});
			throw new ServiceUnavailableError();
		} else {
			const enhancedError = ErrorHandler.enhanceError(error, {
				type: 'api_general_error'
			});
			throw new Error(error.message || "Internal Server Error", { cause: enhancedError });
		}
	}
};
