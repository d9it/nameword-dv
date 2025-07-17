// Import required modules and configurations
const createAxiosInstance = require("./Domain/axiosInstance");
const provider_config = require("./Domain/config");
const {
	getOpenproviderToken,
} = require("./Domain/providers/openprovider/auth");
const openproviderMappings = require("./Domain/providers/openprovider/mappings");
const connectresellerMappings = require("./Domain/providers/connectreseller/mapping");
const normalizeResponse = require("./Domain/providers/normalize");
const ServiceUnavailableError = require("./Domain/ServiceUnavailableError");
const {
	extractTLD,
	getTLDCategory,
	splitDomain,
} = require("./Domain/providers/tldConfig");
const { Logger } = require('./logger');

// Mapping object for different provider endpoints
const ENDPOINT_MAPPING = {
	openprovider: openproviderMappings,
	connectreseller: connectresellerMappings,
};

// Create axios instance for making HTTP requests
const axiosInstance = createAxiosInstance();

// Helper function to resolve path configuration
const resolvePath = (pathConfig, params) => {
	if (typeof pathConfig === "function") {
		return pathConfig(params);
	}
	return pathConfig;
};

// Main function to make API requests to domain providers
const makeRequest = async (provider, type, params, method) => {
	const config = ENDPOINT_MAPPING[provider][type];
	// Set the appropriate API URL based on the provider
	const url =
		provider === "openprovider"
			? provider_config.openprovider.apiUrl
			: provider_config.connectreseller.apiUrl;
	// Set appropriate headers based on the provider
	const headers =
		provider === "openprovider"
			? { Authorization: `Bearer ${await getOpenproviderToken()}` }
			: { "Content-Type": "application/json" };

	// Check if Openprovider token is available
	if (provider === "openprovider" && !headers.Authorization) {
		throw new Error("Openprovider token unavailable");
	}

	try {
		if (provider === "openprovider" && config.steps) {
			// Handle multiple API calls for Openprovider
			const responses = await Promise.all(
				config.steps.map((step) => {
					const resolvedPath = resolvePath(step.path, params);
					return axiosInstance({
						method: step.method,
						url: `${url}${resolvedPath}`,
						headers,
						[step.method === "GET" ? "params" : "data"]:
							step.params(params),
					});
				})
			);

			// Check if all responses are successful
			const allSuccessful = responses.every((res) => res.data.code === 0);
			if (!allSuccessful) {
				throw new Error("One or more Openprovider API calls failed");
			}

			// Combine responses from multiple API calls
			const combinedData = await config.combine(
				responses.map((res) => res.data)
			);
			const message =
				(await config?.message(responses.map((res) => res.data))) || "";
			config?.message(responses.map((res) => res.data)) || "";

			return await normalizeResponse(
				provider,
				params,
				{ code: 0, data: { combined: combinedData }, message },
				type
			);
		} else {
			// Handle single API call
			const resolvedPath = resolvePath(config.path, params);
			const requestParams = config.params
				? config.params(params)
				: params;

			Logger.info(
				"Resolved Path:",
				url,
				resolvedPath,
				requestParams,
				provider_config.connectreseller.apiKey
			);
			const response = await axiosInstance({
				method: config.method,
				url: `${url}${resolvedPath}`,
				headers,
				[config.method === "GET" ? "params" : "data"]: {
					...(provider === "connectreseller"
						? { APIKey: provider_config.connectreseller.apiKey }
						: {}),
					...requestParams,
				},
			});
			Logger.info(
				"Response:=====================================>",
				response
			);
			Logger.info("Response:", provider, JSON.stringify(response.data));
			return await normalizeResponse(
				provider,
				params,
				response.data,
				type
			);
		}
	} catch (error) {
		const ErrorHandler = require('./errorHandler');
		
		// Log error with context
		ErrorHandler.logError(error, {
			type: 'domain_provider_api_error',
			provider,
			requestType: type,
			method: config.method,
			url: `${url}${resolvedPath}`,
			params: JSON.stringify(params)
		});

		// Normalize error response with better error handling
		const normalized = {
			responseMsg: {
				id: 0,
				reason: null,
				statusCode: error?.response?.status || 500,
				message: error.response?.data?.desc || error?.message || "API request failed",
				errorType: error.name || 'UnknownError',
				timestamp: new Date().toISOString()
			},
			responseData: null,
		};
		return normalized;
	}
};

module.exports = {
	// GET request handler with provider fallback
	get: async (type, params, provider = "openprovider") => {
		try {
			if (provider === "both") {
				try {
					return await makeRequest(
						"openprovider",
						type,
						params,
						"GET"
					);
				} catch (openError) {
					Logger.warn(
						`Openprovider failed for ${type}: ${openError.message}. Falling back to ConnectReseller.`
					);
					return await makeRequest(
						"connectreseller",
						type,
						params,
						"GET"
					);
				}
			} else {
				return await makeRequest(provider, type, params, "GET");
			}
		} catch (error) {
			if (error.response) {
				throw new Error(
					`API request failed with status ${error.response.status}: ${
						error.response.data.message || error.message
					}`,
					{ cause: error }
				);
			} else if (error.request) {
				throw new Error("API request failed: No response received");
			} else {
				throw new Error(`API request failed: ${error.message}`);
			}
		}
	},

	// Generic request handler with provider selection logic
	request: async (
		type,
		params,
		method = "get",
		provider = "openprovider"
	) => {
		try {
			if (provider !== "both") {
				return {
					...(await makeRequest(provider, type, params, method)),
					provider,
				};
			}

			try {
				// Extract TLD and determine category for provider selection
				const tld = extractTLD(params.websiteName);
				const TLDCategory = getTLDCategory(tld);

				// Use Openprovider for default and country TLDs
				if (TLDCategory === "default" || TLDCategory === "country") {
					const response = await makeRequest(
						"openprovider",
						type,
						params,
						method
					);
					return { ...response, provider: "openprovider" };
				}

				try {
					// Compare prices from both providers
					const [openProviderResponse, connectResellerResponse] =
						await Promise.all([
							makeRequest("openprovider", type, params, method),
							makeRequest(
								"connectreseller",
								type,
								params,
								method
							),
						]);

					const openProviderPrice =
						openProviderResponse?.responseData?.registrationFee;
					const connectResellerPrice =
						connectResellerResponse?.responseData?.registrationFee;

					Logger.info(
						`Openprovider Price: ${openProviderPrice}, ConnectReseller Price: ${connectResellerPrice}`
					);

					// Choose provider based on price comparison
					return connectResellerPrice +
						provider_config.price_diffrence_threshold <=
						openProviderPrice
						? {
								...connectResellerResponse,
								provider: "connectreseller",
						  }
						: { ...openProviderResponse, provider: "openprovider" };
				} catch {
					// Fallback logic when both providers fail
					Logger.warn(
						"Both Openprovider and ConnectReseller failed. Falling back to Openprovider."
					);
					try {
						const response = await makeRequest(
							"openprovider",
							type,
							params,
							method
						);
						return { ...response, provider: "openprovider" };
					} catch {
						const response = await makeRequest(
							"connectreseller",
							type,
							params,
							method
						);
						return { ...response, provider: "connectreseller" };
					}
				}
			} catch (openError) {
				// Fallback to ConnectReseller if Openprovider fails
				Logger.warn(
					`Openprovider failed for ${type}: ${openError.message}. Falling back to ConnectReseller.`
				);
				const response = await makeRequest(
					"connectreseller",
					type,
					params,
					method
				);
				return { ...response, provider: "connectreseller" };
			}
		} catch (error) {
			// Error handling for API requests
			Logger.error(
				`Error fetching data from third-party API for ${type}:`,
				error
			);
			if (error.response) {
				throw new Error(
					error.response.data.statusText ||
						error.response.statusText ||
						"An error occurred"
				);
			} else if (error.request) {
				throw new ServiceUnavailableError();
			} else {
				throw new Error(error.message || "Internal Server Error");
			}
		}
	},
};
