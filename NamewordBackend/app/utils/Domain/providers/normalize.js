///provider/normalize.js
const axios = require("axios");
const config = require("../config");
const { getOpenproviderToken } = require("./openprovider/auth");
const { splitDomain } = require("./tldConfig");
const getExchangeRate = require("../../../utils/currency");
const { Logger } = require('../../../logger');

// Response handlers for different domain operations
const responseHandlers = {
	// Check domain availability and get pricing
	checkdomainavailable: (data) =>
		data.data.combined || {
			registrationFee:
				data?.data?.results?.[0]?.registration_price?.reseller_price
					?.price || 0,
			renewalFee:
				data?.data?.results?.[0]?.renewal_price?.reseller_price
					?.price || 0,
			transferFee:
				data?.data?.results?.[0]?.transfer_price?.reseller_price
					?.price || 0,
			available: data?.data?.results?.[0]?.status === "available",
		},

	// Get domain price information

	checkDomainPrice: (data) => {
		return data.data.combined || null
	},
	// Get TLD suggestions based on website name
	async getTldSuggestion(data, params, token) {
		const suggesionResponse = await axios({
			method: "POST",
			url: `${config.openprovider.apiUrl}/domains/suggest-name`,
			headers: { Authorization: `Bearer ${token}` },
			data: {
				language: "eng",
				limit: 50,
				name: params.websiteName.split(".")[0],
				provider: "namestudio",
				sensitive: false,
				tlds: data?.data?.results
					?.map((item) => item.name)
					.slice(0, 50),
			},
			timeout: 5000,
		});

		const allDomains = suggesionResponse.data.data.results.filter(
			(item) =>
				item.domain.toLowerCase() ===
				params.websiteName.split(".")[0].toLowerCase()
		);

		const priceResponseTld = await axios({
			method: "POST",
			url: `${config.openprovider.apiUrl}/domains/check`,
			headers: { Authorization: `Bearer ${token}` },
			data: {
				domains: allDomains.slice(0, 15).map((domain) => ({
					name: domain.domain.toLowerCase(),
					extension: domain.tld,
				})),
				with_price: true,
			},
			timeout: 10000,
		});

		return priceResponseTld.data.data.results.map((item) => ({
			websiteName: item.domain,
			domainType: item?.is_premium ? "Premium" : "Standard",
			available: item.status === "free",
		}));
	},

	// Get domain suggestions with pricing
	async domainSuggestion(data, _, token) {
		const domains = data.data.results || [];
		const priceResponse = await axios({
			method: "POST",
			url: `${config.openprovider.apiUrl}/domains/check`,
			headers: { Authorization: `Bearer ${token}` },
			data: {
				domains: domains.map((domain) => (splitDomain(domain.name))),
				with_price: true,
			},
			timeout: 10000,
		});

		return {
			registryDomainSuggestionList: domains.map(async(domain, index) => ({
				domainName: domain.name,
				price:(await getExchangeRate(priceResponse.data?.data?.results[index]?.price?.product.currency, "USD") * priceResponse.data?.data?.results[index]?.price?.product.price).toFixed(2) || 0,
			})),
		};
	},

	// Handle domain order response
	domainorder: (data, params) => [
		{
			domainCreateResp: null,
			domainCreateResponse: {
				msgCode: data.code === 0 ? 1000 : 1,
				msg:
					data.code === 0
						? "Command completed successfully"
						: "Command failed",
				name: params.websiteName,
				creationDate: data?.data?.activation_date,
				expiryDate: data.data.expiration_date,
				domainId: data.data.id,
				status: data.data?.status,
			},
			contactsCreateRS: null,
			hostsCreateRS: [],
			error: null,
			sedoMsg: null,
		},
	],

	// Handle domain transfer order response
	TransferOrder: (data) => ({ orderId: data.data.order_id }),

	// Handle domain renewal order response
	RenewalOrder: (data, params) => ({
		statusCode: data.code,
		message:
			data.data.status === "ACT"
				? "Domain renewed successfully"
				: "FAILED",
		reason: "",
		expiryDate: "",
		domainName: params.websiteName,
	}),

	// View domain details
	ViewDomain: (data, params) => {
		const {
			id,
			owner_handle,
			order_date,
			expiration_date,
			name_servers,
			...rest
		} = data?.data?.results?.[0] || {};
		return {
			...rest, // rest of the keys
			domainNameId: id,
			websiteId:id,
			customerId: owner_handle,
			websiteName: params?.websiteName,
			orderDate: order_date,
			expirationDate: expiration_date,
			nameServers: name_servers || [],
			...name_servers?.reduce((acc, ns, index) => {
                   acc[`nameserver${index + 1}`] = ns.name;
                   return acc;
               }, {})
   
		};
	},

	// Update nameserver response handler
	UpdateNameServer: (data) => ({
		msgCode: data.code === 0 ? 1000 : 1,
		msg:
			data.code === 0
				? "Nameserver updated successfully"
				: "Failed to update nameserver",
	}),

	// Update auth code response handler
	updateAuthCode: (data) => ({
		msgCode: data.code === 0 ? 1000 : 1,
		msg:
			data.code === 0
				? "Authcode updated successfully"
				: "Failed to update authcode",
	}),

	// Manage domain lock response handler
	ManageDomainLock: (data) => ({
		message:
			data.code === 0
				? "Domain lock updated successfully"
				: "Failed to update domain lock",
		id: 0,
		reason: null,
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// Manage privacy protection response handler
	ManageDomainPrivacyProtection: (data) => ({
		message:
			data.code === 0
				? "Privacy protection updated successfully"
				: "Failed to update privacy protection",
		id: 0,
		reason: null,
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// View EPP code response handler
	ViewEPPCode: (data) => data?.data?.results?.[0]?.auth_code,

	// Manage DNS records response handler
	ManageDNSRecords: (data) => {
		return {
		message:
			data.code === 0
				? "DNS Management enabled successfully"
				: "Failed to enable DNS Management",
		id: 0,
		reason: null,
		statusCode: data.code === 0 ? 200 : data.code,
	}},

	// Add DNS record response handler
	AddDNSRecord: (data) => ({
		message: "Records ADDED Successfully",
		id: null,
		reason: null,
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// Modify DNS record response handler
	ModifyDNSRecord: (data) => ({
		message:
			data.code === 0
				? "DNS record modified successfully"
				: "Failed to modify DNS record",
		statusCode: data.code === 0 ? 200 : data.code,
		id: null,
		reason: null,
	}),

	// Delete DNS record response handler
	DeleteDNSRecord: (data) => ({
		message:
			data.code === 0
				? "DNS record deleted successfully"
				: "Failed to delete DNS record",
		statusCode: data.code === 0 ? 200 : data.code,
		id: null,
		reason: null,
	}),

	// View DNS records response handler
	ViewDNSRecord: (data) => ({
		records: data.data?.records || [],
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// Set domain forwarding response handler
	SetDomainForwarding: (data) => ({
		message:
			data.code === 0
				? "Domain forwarding set successfully"
				: "Failed to set domain forwarding",
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// Get domain forwarding response handler
	GetDomainForwarding: (data) => ({
		forwarding: data.data?.forwarding || {},
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// Update domain forwarding response handler
	updatedomainforwarding: (data) => ({
		message:
			data.code === 0
				? "Domain forwarding updated successfully"
				: "Failed to update domain forwarding",
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// Delete domain forwarding response handler
	deletedomainforwarding: (data) => ({
		message:
			data.code === 0
				? "Domain forwarding deleted successfully"
				: "Failed to delete domain forwarding",
		statusCode: data.code === 0 ? 200 : data.code,
	}),

	// Add child nameserver response handler
	AddChildNameServer: (data, params) => ({
		message:
			data.code === 0
				? `Child nameserver ${params?.hostName} added successfully`
				: "Failed to add child nameserver",
		statusCode: data.code === 0 ? 200 : data.code,
		name: params?.hostName || null,
		creationDate: data.data?.creationDate || null,
	}),

	// Modify child nameserver IP response handler
	ModifyChildNameServerIP: (data, params) => ({
		message:
			data.code === 0
				? `Child nameserver ${params?.hostName} modify successfully`
				: "Failed to modify child nameserver",
		statusCode: data.code === 0 ? 200 : data.code,
		name: params?.hostName || null,
		creationDate: data.data?.creationDate || null,
	}),

	// Modify child nameserver hostname response handler
	ModifyChildNameServerHostname: (data, params) => ({
		message:
			data.code === 0
				? `Child nameserver ${params?.hostName} modify successfully`
				: "Failed to modify child nameserver",
		statusCode: data.code === 0 ? 200 : data.code,
		name: params?.hostName || null,
		creationDate: data.data?.creationDate || null,
	}),

	// Delete child nameserver response handler
	DeleteChildNameServer: (data, params) => ({
		message:
			data.code === 0
				? `Child nameserver ${params?.hostName} deleted successfully`
				: "Failed to delete child nameserver",
		statusCode: data.code === 0 ? 200 : data.code,
		name: params?.hostName || null,
		creationDate: data.data?.creationDate || null,
	}),

	// Get child nameservers response handler
	getchildnameservers: (data) =>
		data?.data?.results?.[0]?.name_servers?.filter((ns) => ns?.ip) || [],

	// Default response handler
	default: (data) => data.data || data,
};

// Normalize API response based on provider and operation type
const normalizeResponse = async (provider, params, data, type) => {
	// Only process for openprovider
	if (provider !== "openprovider") return data;

	const token = await getOpenproviderToken();
	const normalized = {
		responseMsg: {
			id: 0,
			reason: null,
			statusCode: data.code === 0 ? 200 : data.code,
			message: data.message ?? "Success",
		},
		responseData: {},
	};

	// Get appropriate handler based on operation type or use default
	const handler = responseHandlers[type] || responseHandlers.default;
	normalized.responseData = await handler(data, params, token);

	return normalized;
};

module.exports = normalizeResponse;
