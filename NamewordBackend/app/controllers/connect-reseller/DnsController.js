const Domain = require("../../models/Domain");
const apiClient = require("../../utils/apiclient");
const domainProviderApiClient = require("../../utils/domainProviderApiClient");
const { saveActivity } = require("../activityController");
const Cloudflare = require("cloudflare");

const cloudflare = new Cloudflare({
	apiEmail: process.env.CLOUDFLARE_EMAIL,
	apiKey: process.env.CLOUDFLARE_API_KEY,
});

class DnsController {
	async manageDNSRecords(req, res) {
		const { domain, domainId, provider } = req.query;
		const detail = await domainProviderApiClient.request(
			"ViewDomain",
			{ websiteName: domain, domainId },
			null,
			provider
		);
		const id = detail.responseData.websiteId;
		const params = {
			WebsiteName: domain,
			WebsiteId: id,
		};

		// If provider is OpenProvider, create/update Cloudflare zone
		// if (provider === 'openprovider') {
		// 	try {
		// 		// Check if domain already has a Cloudflare zone
		// 		const zones = await cloudflare.zones.list({ name: domain });
		// 		let zoneId;

		// 		if (zones.result.length === 0) {
		// 			// Create new zone
		// 			const response = await cloudflare.zones.create({
		// 				name: domain,
		// 				type: 'full',
		// 			});
		// 			zoneId = response.id;

		// 			// Set SSL encryption mode to 'Full'
		// 			await cloudflare.zones.settings.edit('ssl', {
		// 				value: 'full',
		// 				zone_id: zoneId,
		// 			});

		// 			// Enable 'Always use HTTPS' setting
		// 			await cloudflare.zones.settings.edit('always_use_https', {
		// 				value: 'on',
		// 				zone_id: zoneId,
		// 			});

		// 			// Update nameservers in OpenProvider
		// 			await domainProviderApiClient.get('UpdateNameServer', {
		// 				domainNameId: domainId,
		// 				websiteName: domain,
		// 				nameServer1: response.name_servers[0],
		// 				nameServer2: response.name_servers[1],
		// 			}, provider);

		// 			// Add default A record
		// 			// await cloudflare.dns.records.create({
		// 			// 	zone_id: zoneId,
		// 			// 	type: 'A',
		// 			// 	name: '@',
		// 			// 	content: process.env.SERVER_IP,
		// 			// 	ttl: 3600,
		// 			// 	proxied: true
		// 			// });
		// 		} else {
		// 			zoneId = allZones[0].id;
		// 		}

		// 		// Get DNS records from OpenProvider
		// 		const openProviderResponse = await domainProviderApiClient.get(
		// 			"ViewDNSRecord",
		// 			params,
		// 			provider
		// 		);

		// 		// Sync DNS records to Cloudflare
		// 		if (openProviderResponse.records) {
		// 			for (const record of openProviderResponse.records) {
		// 				const recordName = record.name === domain ? '@' : record.name.replace(`.${domain}`, '');

		// 				// Check if record exists
		// 				const existingRecords = await cloudflare.dns.records.list({
		// 					zone_id: zoneId,
		// 					name: recordName,
		// 					type: record.type
		// 				});

		// 				if (existingRecords.result.length === 0) {
		// 					// Create new record
		// 					await cloudflare.dns.records.create({
		// 						zone_id: zoneId,
		// 						type: record.type,
		// 						name: recordName,
		// 						content: record.value,
		// 						ttl: record.ttl || 3600,
		// 						proxied: true
		// 					});
		// 				}
		// 			}
		// 		}

		// 		return res.status(200).json({
		// 			responseMsg: {
		// 				id: 0,
		// 				reason: null,
		// 				statusCode: data.code === 0 ? 200 : data.code,
		// 				message: data.message ?? "Success",
		// 			},
		// 			responseData: {
		// 				message:
		// 	data.code === 0
		// 		? "DNS Management enabled successfully"
		// 		: "Failed to enable DNS Management",
		// id: 0,
		// reason: null,
		// statusCode: data.code === 0 ? 200 : data.code,
		// 			},
		// 			// message: 'DNS records managed successfully',
		// 			// cloudflare: {
		// 			// 	zoneId,
		// 			// 	nameservers: zones.result[0]?.name_servers
		// 			// }
		// 		});
		// 	} catch (error) {
		// 		console.error('Error managing DNS records:', error);
		// 		return res.status(500).json({ message: 'Error managing DNS records' });
		// 	}
		// }

		// For other providers, use existing logic
		const response = await domainProviderApiClient.get(
			"ManageDNSRecords",
			params,
			provider
		);

		return res.status(200).json(response);
	}

	async addDNSRecord(req, res) {
		let {
			dnsZoneId,
			recordName,
			recordType,
			recordValue,
			recordPriority,
			recordTTL,
			domain,
			provider,
		} = req.query;

		let domainData = await Domain.findOne({ websiteName: domain });

		provider = domainData?.provider || provider;
		if (
			domainData?.provider === "openprovider" &&
			domainData?.cloudflare?.zoneId
		) {
			try {
				const zoneId = domainData?.cloudflare?.zoneId;
				const formattedName =
					recordName === domain
						? "@"
						: recordName.replace(`.${domain}`, "");

				const response = await cloudflare.dns.records.create({
					zone_id: zoneId,
					type: recordType,
					name: formattedName,
					content: recordValue,
					ttl: Number(recordTTL) || 3600,
					proxied: true,
				});

				// Log DNS add activity for Cloudflare
				try {
					await saveActivity({
						userId: req.user.id,
						domain: domain,
						activityType: "dns",
						activity: `Added DNS record ${recordName} (${recordType}) [Cloudflare]`,
						status:
							response?.success === false
								? "Rejected"
								: "Successful",
					});
				} catch (activityError) {
					console.error(
						"Failed to log DNS add activity:",
						activityError
					);
				}

				return res.status(200).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: 200,
						message: "Success",
					},
					responseData: {
						message: "Records ADDED Successfully",
						id: null,
						reason: null,
						statusCode: 200,
					},
				});
			} catch (error) {
				console.error("Error adding DNS record:", error);
				return res.status(500).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: error?.response?.status || 500,
						message:
							error.response?.data?.desc ||
							error?.message ||
							"Unknown error occurred",
					},
					responseData: null,
				});
			}
		}

		// For other providers, use existing logic
		const params = {
			DNSZoneID: dnsZoneId,
			RecordName:
				provider === "openprovider"
					? recordName === domain
						? null
						: recordName.replace(`.${domain}`, "")
					: recordName,
			RecordType: recordType,
			RecordValue: recordValue,
			RecordPriority: recordPriority,
			RecordTTL: recordTTL,
			WebsiteName: domain,
		};

		const response = await domainProviderApiClient.request(
			"AddDNSRecord",
			params,
			null,
			provider
		);

		// Log DNS add activity for other providers
		try {
			await saveActivity({
				userId: req.user.id,
				domain: domain,
				activityType: "dns",
				activity: `Added DNS record ${recordName} (${recordType})`,
				status:
					response?.responseMsg?.statusCode === 200
						? "Successful"
						: "Rejected",
			});
		} catch (activityError) {
			console.error("Failed to log DNS add activity:", activityError);
		}
		return res.status(200).json(response);
	}

	async modifyDNSRecord(req, res) {
		let {
			dnsZoneId,
			dnsZoneRecordId,
			recordName,
			recordType,
			recordValue,
			recordTTL,
			recordPriority,
			oldRecordName,
			oldRecordType,
			oldRecordValue,
			oldRecordTTL,
			oldRecordPriority,
			domain,
			provider,
		} = req.query;

		// If provider is OpenProvider, modify record in Cloudflare
		let domainData = await Domain.findOne({ websiteName: domain });

		provider = domainData?.provider || provider;
		if (
			domainData?.provider === "openprovider" &&
			domainData?.cloudflare?.zoneId
		) {
			try {
				const zoneId = domainData?.cloudflare?.zoneId;
				const formattedName =
					recordName === domain
						? "@"
						: recordName.replace(`.${domain}`, "");

				// Update record in Cloudflare
				const response = await cloudflare.dns.records.edit(
					dnsZoneRecordId,
					{
						zone_id: zoneId,
						type: recordType,
						name: formattedName,
						content: recordValue,
						ttl: Number(recordTTL) || 3600,
						proxied: true,
					}
				);

				return res.status(200).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: 200,
						message: "Success",
					},
					responseData: {
						message: "Records Modified Successfully",
						id: null,
						reason: null,
						statusCode: 200,
					},
				});
			} catch (error) {
				console.error("Error modifying DNS record:", error);
				return res.status(500).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: error?.response?.status || 500,
						message:
							error.response?.data?.desc ||
							error?.message ||
							"Unknown error occurred",
					},
					responseData: null,
				});
			}
		}

		// For other providers, use existing logic
		const params = {
			DNSZoneID: dnsZoneId,
			DNSZoneRecordID: dnsZoneRecordId,
			RecordName:
				provider === "openprovider"
					? recordName === domain
						? null
						: recordName.replace(`.${domain}`, "")
					: recordName,
			RecordType: recordType,
			RecordValue: recordValue,
			RecordTTL: recordTTL,
			RecordPriority: recordPriority,
			OldRecordName:
				provider === "openprovider"
					? oldRecordName === domain
						? null
						: oldRecordName.replace(`.${domain}`, "")
					: oldRecordName,
			OldRecordType: oldRecordType,
			OldRecordValue: oldRecordValue,
			OldRecordTTL: oldRecordTTL,
			OldRecordPriority: oldRecordPriority,
			WebsiteName: domain,
		};
		const response = await domainProviderApiClient.get(
			"ModifyDNSRecord",
			params,
			provider
		);
		// Log DNS modify activity
		try {
			await saveActivity({
				userId: req.user.id,
				domain: domain,
				activityType: "dns",
				activity: `Modified DNS record ${recordName} (${recordType})`,
				status:
					response?.responseMsg?.statusCode === 200
						? "Successful"
						: "Rejected",
			});
		} catch (activityError) {
			console.error("Failed to log DNS modify activity:", activityError);
		}
		return res.status(200).json(response);
	}

	async deleteDNSRecord(req, res) {
		let {
			dnsZoneId,
			dnsZoneRecordId,
			domain,
			recordName,
			recordTTL,
			recordPriority,
			recordType,
			recordValue,
			provider,
		} = req.query;

		// If provider is OpenProvider, delete record from Cloudflare
		let domainData = await Domain.findOne({ websiteName: domain });

		provider = domainData?.provider || provider;
		if (
			domainData?.provider === "openprovider" &&
			domainData?.cloudflare?.zoneId
		) {
			try {
				const zoneId = domainData?.cloudflare?.zoneId;

				// Delete record from Cloudflare
				await cloudflare.dns.records.delete(dnsZoneRecordId, {
					zone_id: zoneId,
				});

				return res.status(200).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: 200,
						message: "Success",
					},
					responseData: {
						message: "Records Deleted Successfully",
						id: null,
						reason: null,
						statusCode: 200,
					},
				});
			} catch (error) {
				console.error("Error deleting DNS record:", error);
				return res.status(500).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: error?.response?.status || 500,
						message:
							error.response?.data?.desc ||
							error?.message ||
							"Unknown error occurred",
					},
					responseData: null,
				});
			}
		}

		// For other providers, use existing logic
		const params = {
			DNSZoneID: dnsZoneId,
			DNSZoneRecordID: dnsZoneRecordId,
			RecordName:
				provider === "openprovider"
					? recordName === domain
						? null
						: recordName.replace(`.${domain}`, "")
					: recordName,
			RecordType: recordType,
			RecordValue: recordValue,
			RecordTTL: recordTTL,
			RecordPriority: recordPriority,
			WebsiteName: domain,
		};
		const response = await domainProviderApiClient.request(
			"DeleteDNSRecord",
			params,
			null,
			provider
		);
		// Log DNS delete activity
		try {
			await saveActivity({
				userId: req.user.id,
				domain: domain,
				activityType: "dns",
				activity: `Deleted DNS record ${recordName} (${recordType})`,
				status:
					response?.responseMsg?.statusCode === 200
						? "Successful"
						: "Rejected",
			});
		} catch (activityError) {
			console.error("Failed to log DNS delete activity:", activityError);
		}
		return res.status(200).json(response);
	}

	async viewDNSRecord(req, res) {
		const { domain, domainId, provider } = req.query;
		let domainData = await Domain.findOne({ websiteName: domain });

		// If provider is OpenProvider, get records from Cloudflare
		if (
			domainData?.provider === "openprovider" &&
			domainData?.cloudflare?.zoneId
		) {
			try {
				const zoneId = domainData?.cloudflare?.zoneId;
				// Get records from Cloudflare
				const response = await cloudflare.dns.records.list({
					zone_id: zoneId,
				});
				console.log("response ===========>", response);
				// Format records to match OpenProvider format
				const formattedRecords = response.result.map((record) => ({
					// name: record.name === '@' ? domain : `${record.name}`,
					name: record.name,
					type: record.type,
					value: record.content,
					ttl: record.ttl,
					priority: record.priority,
					id: record.id,
				}));

				return res.status(200).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: 200,
						message: "Success",
					},
					responseData: {
						records: formattedRecords,
						statusCode: 200,
					},
				});
			} catch (error) {
				console.error("Error viewing DNS records:", error);
				return res.status(500).json({
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: error?.response?.status || 500,
						message:
							error.response?.data?.desc ||
							error?.message ||
							"Unknown error occurred",
					},
					responseData: null,
				});
			}
		}

		// For other providers, use existing logic
		const detail = await domainProviderApiClient.request(
			"ViewDomain",
			{
				websiteName: domain,
				domainId,
			},
			null,
			provider
		);
		const id = detail.responseData?.websiteId;
		const params = {
			WebsiteName: domain,
			WebsiteId: id,
		};
		const response = await domainProviderApiClient.get(
			"ViewDNSRecord",
			params,
			provider
		);
		return res.status(200).json(response);
	}

	// DNSSEC CRUD APIs
	async viewDNSSEC(req, res) {
		let { domain, provider } = req.query;
		console.log("provider ===========>", provider);
		if (!provider) {
			provider = "connectreseller";
		}
		try {
			let domainData = await Domain.findOne({ websiteName: domain });
			if (
				domainData?.provider === "openprovider" &&
				domainData?.cloudflare?.zoneId
			) {
				const zoneId = domainData.cloudflare.zoneId;
				const response = await cloudflare.zones.dnssec.read(zoneId);
				return res.status(200).json({
					responseMsg: { statusCode: 200, message: "Success" },
					responseData: { dnssec: response.result },
				});
			}
			let response;
			if (provider === "openprovider") {
				// OpenProvider: Get domain details, extract DNSSEC info
				response = await domainProviderApiClient.get(
					"ViewDomain",
					{ websiteName: domain },
					provider
				);
				const dnssec = response?.responseData?.dnssec || [];
				return res.status(200).json({
					responseMsg: { statusCode: 200, message: "Success" },
					responseData: { dnssec },
				});
			} else {
				// ConnectReseller: Use GetDNSSec
				response = await domainProviderApiClient.get(
					"GetDNSSec",
					{ domain },
					provider
				);
				return res.status(200).json(response);
			}
		} catch (error) {
			return res
				.status(500)
				.json({ message: error.message || "Error viewing DNSSEC" });
		}
	}

	async addDNSSEC(req, res) {
		const { domain, provider } = req.body;
		try {
			let domainData = await Domain.findOne({ websiteName: domain });
			let response,
				status = "Successful";
			if (
				domainData?.provider === "openprovider" &&
				domainData?.cloudflare?.zoneId
			) {
				const zoneId = domainData.cloudflare.zoneId;
				response = await cloudflare.zones.dnssec.edit(zoneId, {
					status: "active",
				});
				status =
					response?.success === false ? "Rejected" : "Successful";
			} else if (provider === "openprovider") {
				// OpenProvider: Update domain with DNSSEC data
				const { keyTag, algorithm, digestType, digest } = req.body;
				const params = {
					websiteName: domain,
					dnssec: [{ keyTag, algorithm, digestType, digest }],
				};
				response = await domainProviderApiClient.request(
					"ManageDomainDNSSEC",
					params,
					"PUT",
					provider
				);
			} else {
				// ConnectReseller: AddDNSSec
				const { keyTag, algorithm, digestType, digest } = req.body;
				const params = {
					domain,
					keyTag,
					algorithm,
					digestType,
					digest,
				};
				response = await domainProviderApiClient.request(
					"AddDNSSec",
					params,
					"POST",
					provider
				);
			}

			// Log DNSSEC add activity
			try {
				await saveActivity({
					userId: req.user.id,
					domain: domain,
					activityType: "dnssec",
					activity: `Added DNSSEC record`,
					status,
				});
			} catch (activityError) {
				console.error(
					"Failed to log DNSSEC add activity:",
					activityError
				);
			}
			return res.status(200).json(response);
		} catch (error) {
			console.log("error ===========>", error);
			return res
				.status(500)
				.json({ message: error.message || "Error adding DNSSEC" });
		}
	}

	async modifyDNSSEC(req, res) {
		const { domain, provider } = req.body;
		try {
			let domainData = await Domain.findOne({ websiteName: domain });
			let response,
				status = "Successful";
			if (
				domainData?.provider === "openprovider" &&
				domainData?.cloudflare?.zoneId
			) {
				const zoneId = domainData.cloudflare.zoneId;
				response = await cloudflare.zones.dnssec.edit(zoneId, {
					status: "active",
				});
				status =
					response?.success === false ? "Rejected" : "Successful";
			} else if (provider === "openprovider") {
				const {
					keyTag,
					algorithm,
					digestType,
					digest,
					oldKeyTag,
					oldAlgorithm,
					oldDigestType,
					oldDigest,
				} = req.body;
				// OpenProvider: Update domain with new DNSSEC data
				const params = {
					websiteName: domain,
					dnssec: [{ keyTag, algorithm, digestType, digest }],
					oldDnssec: [
						{
							keyTag: oldKeyTag,
							algorithm: oldAlgorithm,
							digestType: oldDigestType,
							digest: oldDigest,
						},
					],
				};
				response = await domainProviderApiClient.request(
					"ManageDomainDNSSEC",
					params,
					"PUT",
					provider
				);
			} else {
				const {
					keyTag,
					algorithm,
					digestType,
					digest,
					oldKeyTag,
					oldAlgorithm,
					oldDigestType,
					oldDigest,
				} = req.body;
				// ConnectReseller: Delete old, add new
				await domainProviderApiClient.request(
					"DeleteDNSSec",
					{
						domain,
						keyTag: oldKeyTag,
						algorithm: oldAlgorithm,
						digestType: oldDigestType,
						digest: oldDigest,
					},
					"POST",
					provider
				);
				response = await domainProviderApiClient.request(
					"AddDNSSec",
					{ domain, keyTag, algorithm, digestType, digest },
					"POST",
					provider
				);
			}

			// Log DNSSEC modify activity
			try {
				await saveActivity({
					userId: req.user.id,
					domain: domain,
					activityType: "dnssec",
					activity: `Modified DNSSEC record`,
					status,
				});
			} catch (activityError) {
				console.error(
					"Failed to log DNSSEC modify activity:",
					activityError
				);
			}
			return res.status(200).json(response);
		} catch (error) {
			console.log("error ===========>", error);
			return res
				.status(500)
				.json({ message: error.message || "Error modifying DNSSEC" });
		}
	}

	async deleteDNSSEC(req, res) {
		const { domain, provider } = req.body;
		try {
			let domainData = await Domain.findOne({ websiteName: domain });
			let response,
				status = "Successful";
			if (
				domainData?.provider === "openprovider" &&
				domainData?.cloudflare?.zoneId
			) {
				const zoneId = domainData.cloudflare.zoneId;
				response = await cloudflare.zones.dnssec.edit(zoneId, {
					status: "disabled",
				});
				status =
					response?.success === false ? "Rejected" : "Successful";
			} else if (provider === "openprovider") {
				const { keyTag, algorithm, digestType, digest } = req.body;
				// OpenProvider: Remove DNSSEC data
				const params = {
					websiteName: domain,
					dnssec: [], // Remove all
				};
				response = await domainProviderApiClient.request(
					"ManageDomainDNSSEC",
					params,
					"PUT",
					provider
				);
			} else {
				const { keyTag, algorithm, digestType, digest } = req.body;
				// ConnectReseller: DeleteDNSSec
				const params = {
					domain,
					keyTag,
					algorithm,
					digestType,
					digest,
				};
				response = await domainProviderApiClient.request(
					"DeleteDNSSec",
					params,
					"POST",
					provider
				);
			}

			// Log DNSSEC delete activity
			try {
				await saveActivity({
					userId: req.user.id,
					domain: domain,
					activityType: "dnssec",
					activity: `Deleted DNSSEC record`,
					status,
				});
			} catch (activityError) {
				console.error(
					"Failed to log DNSSEC delete activity:",
					activityError
				);
			}
			return res.status(200).json(response);
		} catch (error) {
			return res
				.status(500)
				.json({ message: error.message || "Error deleting DNSSEC" });
		}
	}
}

module.exports = new DnsController();
