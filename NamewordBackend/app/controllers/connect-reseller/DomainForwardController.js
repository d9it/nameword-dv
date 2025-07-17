const apiClient = require("../../utils/apiclient");
const domainProviderApiClient = require("../../utils/domainProviderApiClient");
const Domain = require("../../models/Domain");
const { saveActivity } = require("../activityController");
const Cloudflare = require("cloudflare");

const cloudflare = new Cloudflare({
	apiEmail: process.env.CLOUDFLARE_EMAIL,
	apiKey: process.env.CLOUDFLARE_API_KEY,
});

class DomainForwardController {
	async store(req, res) {
		let { domainNameId, websiteId, isMasking, rewrite, domainName } =
			req.query;
		let domainData = await Domain.findOne({ websiteName: domainName });
		let provider = domainData?.provider || "connectreseller";
		try {
			let response;
			if (provider === "openprovider" && domainData?.cloudflare?.zoneId) {
				// Add CNAME to Cloudflare (root domain)
				const zoneId = domainData.cloudflare.zoneId;
				await cloudflare.dns.records.create({
					zone_id: zoneId,
					type: "CNAME",
					name: domainName,
					content: rewrite,
					ttl: 3600,
					proxied: true,
				});
				response = {
					responseMsg: {
						statusCode: 200,
						message: "CNAME record created in Cloudflare",
					},
					responseData: null,
				};
			} else if (provider === "openprovider") {
				// Add CNAME to OpenProvider (with zone creation/retry)
				const cnameParams = {
					WebsiteName: domainName,
					RecordName: domainName,
					RecordType: "CNAME",
					RecordValue: rewrite,
					RecordTTL: 3600,
					DNSZoneID: websiteId,
				};
				response = await domainProviderApiClient.request(
					"AddDNSRecord",
					cnameParams,
					null,
					provider
				);
				if (
					response?.responseMsg?.statusCode === 872 ||
					response?.code === 872
				) {
					await domainProviderApiClient.request(
						"ManageDNSRecords",
						{ WebsiteName: domainName, WebsiteId: websiteId },
						null,
						provider
					);
					response = await domainProviderApiClient.request(
						"AddDNSRecord",
						cnameParams,
						null,
						provider
					);
				}
			} else {
				// ConnectReseller direct domain forwarding
				response = await domainProviderApiClient.request(
					"SetDomainForwarding",
					{ domainNameId, websiteId, isMasking, rewrite },
					null,
					provider
				);
			}
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Root forwarding created for ${domainName}`,
				status: "Successful",
			});
			return res.status(200).json(response);
		} catch (error) {
			console.log(
				"error DomainForwardController==================>",
				error
			);
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Root forwarding creation failed for ${domainName}`,
				status: "Rejected",
			});
			return res.status(500).json({
				responseMsg: {
					statusCode: 500,
					message: error.message || "Internal server error",
				},
				responseData: null,
			});
		}
	}

	async view(req, res) {
		let { websiteId, provider } = req.query;
		const response = await domainProviderApiClient.request(
			"GetDomainForwarding",
			{
				websiteId,
			},
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async all(req, res) {
		let { websiteId, provider, domain } = req.query;

		try {
			let cnameRecords = [];
			let domainForwardingResponse = null;
			let domainData = null;
			if (domain) {
				domainData = await Domain.findOne({ websiteName: domain });
			}

			if (provider === "openprovider" && domainData?.cloudflare?.zoneId) {
				// Get CNAME records from Cloudflare
				const zoneId = domainData.cloudflare.zoneId;
				const cfResponse = await cloudflare.dns.records.list({
					zone_id: zoneId,
				});
				if (cfResponse.result) {
					cnameRecords = cfResponse.result
						.filter((r) => r.type === "CNAME")
						.map((record) => ({
							domainForwardId: record.id || null,
							websiteName: record.name,
							resellerId: null,
							statusID: null,
							isMasking: null,
							rewrite: null,
							proxyPass: record.content,
							lastModifyDate: record.modified_on
								? new Date(record.modified_on).getTime()
								: null,
							title: null,
						}));
				}
				domainForwardingResponse = { responseData: [] };
			} else {
				domainForwardingResponse =
					await domainProviderApiClient.request(
						"GetDomainForwarding",
						{ websiteId },
						null,
						provider
					);

				// Format domain forwarding records
				let formattedDomainForwarding = (
					domainForwardingResponse.responseData || []
				).map((record) => ({
					domainForwardId:
						record.domainForwardId || record.id || null,
					websiteName: record.websiteName || record.domain || null,
					resellerId: record.resellerId || null,
					statusID: record.statusID || null,
					isMasking: record.isMasking || null,
					rewrite: record.rewrite || null,
					proxyPass:
						record.proxyPass ||
						record.forwardTo ||
						record.destination ||
						null,
					lastModifyDate:
						record.lastModifyDate || record.modified_on
							? new Date(record.modified_on).getTime()
							: null,
					title: record.title || null,
				}));
				// Get CNAMEs from DNS if domain is present
				if (domain) {
					const domainDetail = await domainProviderApiClient.request(
						"ViewDomain",
						{ websiteName: domain },
						null,
						provider
					);
					const domainId = domainDetail.responseData?.websiteId;
					if (domainId) {
						const dnsParams = {
							WebsiteName: domain,
							WebsiteId: domainId,
						};
						const dnsResponse = await domainProviderApiClient.get(
							"ViewDNSRecord",
							dnsParams,
							provider
						);
						if (dnsResponse.responseData?.records) {
							cnameRecords = dnsResponse.responseData.records
								.filter((record) => record.type === "CNAME")
								.map((record) => ({
									domainForwardId: record.id || null,
									websiteName: record.name,
									resellerId: null,
									statusID: null,
									isMasking: null,
									rewrite: null,
									proxyPass: record.value,
									lastModifyDate: record.modified_on
										? new Date(record.modified_on).getTime()
										: null,
									title: null,
								}));
						}
					}
				}
				// Merge formatted domain forwarding and CNAMEs
				cnameRecords = [...formattedDomainForwarding, ...cnameRecords];
			}

			const combinedResponse = {
				responseMsg: {
					id: 0,
					reason: null,
					statusCode: 200,
					message: "Success",
				},
				responseData: {
					domainForwarding: cnameRecords,
					statusCode: 200,
				},
			};

			return res.status(200).json(combinedResponse);
		} catch (error) {
			console.error("Error in all function:", error);
			return res.status(500).json({
				responseMsg: {
					id: 0,
					reason: null,
					statusCode: 500,
					message: error.message || "Internal server error",
				},
				responseData: null,
			});
		}
	}

	async update(req, res) {
		let {
			domainNameId,
			websiteId,
			isMasking,
			rewrite,
			domainName,
			provider,
			dnsZoneRecordId,
		} = req.query;
		if (!provider && domainName) {
			let domainData = await Domain.findOne({ websiteName: domainName });
			provider = domainData?.provider || "connectreseller";
		}
		let domainData = await Domain.findOne({ websiteName: domainName });
		try {
			let response;
			if (provider === "openprovider" && domainData?.cloudflare?.zoneId) {
				// Update CNAME in Cloudflare (root domain)
				const zoneId = domainData.cloudflare.zoneId;
				await cloudflare.dns.records.edit(dnsZoneRecordId, {
					zone_id: zoneId,
					type: "CNAME",
					name: domainName,
					content: rewrite,
					ttl: 3600,
					proxied: true,
				});
				response = {
					responseMsg: {
						statusCode: 200,
						message: "CNAME record updated in Cloudflare",
					},
					responseData: null,
				};
			} else if (provider === "openprovider") {
				// Update CNAME in OpenProvider
				const cnameParams = {
					WebsiteName: domainName,
					DNSZoneID: websiteId,
					DNSZoneRecordID: dnsZoneRecordId,
					RecordName: domainName,
					RecordType: "CNAME",
					RecordValue: rewrite,
					RecordTTL: 3600,
					OldRecordName: domainName,
					OldRecordType: "CNAME",
					OldRecordValue: "",
					OldRecordTTL: 3600,
				};
				response = await domainProviderApiClient.request(
					"ModifyDNSRecord",
					cnameParams,
					null,
					provider
				);
			} else {
				// ConnectReseller direct domain forwarding update
				response = await domainProviderApiClient.request(
					"updatedomainforwarding",
					{ domainNameId, websiteId, isMasking, rewrite },
					null,
					provider
				);
			}
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Root forwarding updated for ${domainName}`,
				status: "Successful",
			});
			return res.status(200).json(response);
		} catch (error) {
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Root forwarding update failed for ${domainName}`,
				status: "Rejected",
			});
			return res.status(500).json({
				responseMsg: {
					statusCode: 500,
					message: error.message || "Internal server error",
				},
				responseData: null,
			});
		}
	}

	async destroy(req, res) {
		let { websiteId, domainNameId, domainName, provider, dnsZoneRecordId } =
			req.query;
		if (!provider && domainName) {
			let domainData = await Domain.findOne({ websiteName: domainName });
			provider = domainData?.provider || "connectreseller";
		}
		let domainData = await Domain.findOne({ websiteName: domainName });
		try {
			let response;
			if (provider === "openprovider" && domainData?.cloudflare?.zoneId) {
				// Delete CNAME in Cloudflare (root domain)
				const zoneId = domainData.cloudflare.zoneId;
				await cloudflare.dns.records.delete(dnsZoneRecordId, {
					zone_id: zoneId,
				});
				response = {
					responseMsg: {
						statusCode: 200,
						message: "CNAME record deleted in Cloudflare",
					},
					responseData: null,
				};
			} else if (provider === "openprovider") {
				// Delete CNAME in OpenProvider
				const cnameParams = {
					WebsiteName: domainName,
					DNSZoneID: websiteId,
					DNSZoneRecordID: domainNameId,
					RecordName: domainName,
					RecordType: "CNAME",
					RecordValue: "",
					RecordTTL: 3600,
				};
				response = await domainProviderApiClient.request(
					"DeleteDNSRecord",
					cnameParams,
					null,
					provider
				);
			} else {
				// ConnectReseller direct domain forwarding delete
				response = await domainProviderApiClient.request(
					"deletedomainforwarding",
					{ websiteId, domainNameId },
					null,
					provider
				);
			}
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Root forwarding deleted for ${domainName}`,
				status: "Successful",
			});
			return res.status(200).json(response);
		} catch (error) {
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Root forwarding deletion failed for ${domainName}`,
				status: "Rejected",
			});
			return res.status(500).json({
				responseMsg: {
					statusCode: 500,
					message: error.message || "Internal server error",
				},
				responseData: null,
			});
		}
	}

	async subdomainStore(req, res) {
		let {
			domainNameId,
			websiteId,
			isMasking,
			rewrite,
			subDomain,
			domainName,
			provider,
			dnsZoneRecordId,
		} = req.query;
		if (!provider && domainName) {
			let domainData = await Domain.findOne({ websiteName: domainName });
			provider = domainData?.provider || "connectreseller";
		}
		let domainData = await Domain.findOne({ websiteName: domainName });
		try {
			let response;
			const cnameName = `${subDomain}.${domainName}`;
			if (provider === "openprovider" && domainData?.cloudflare?.zoneId) {
				// Add/update CNAME to Cloudflare (subdomain)
				const zoneId = domainData.cloudflare.zoneId;
				if (dnsZoneRecordId) {
					await cloudflare.dns.records.edit(dnsZoneRecordId, {
						zone_id: zoneId,
						type: "CNAME",
						name: cnameName,
						content: rewrite,
						ttl: 3600,
						proxied: true,
					});
					response = {
						responseMsg: {
							statusCode: 200,
							message: `CNAME record updated for ${cnameName} in Cloudflare`,
						},
						responseData: null,
					};
				} else {
					await cloudflare.dns.records.create({
						zone_id: zoneId,
						type: "CNAME",
						name: cnameName,
						content: rewrite,
						ttl: 3600,
						proxied: true,
					});
					response = {
						responseMsg: {
							statusCode: 200,
							message: `CNAME record created for ${cnameName} in Cloudflare`,
						},
						responseData: null,
					};
				}
			} else if (provider === "openprovider") {
				// Add/update CNAME to OpenProvider (with zone creation/retry for add)
				const cnameParams = {
					WebsiteName: domainName,
					RecordName: cnameName,
					RecordType: "CNAME",
					RecordValue: rewrite,
					RecordTTL: 3600,
					DNSZoneID: websiteId,
				};
				if (dnsZoneRecordId) {
					// Update
					cnameParams.DNSZoneRecordID = dnsZoneRecordId;
					cnameParams.OldRecordName = cnameName;
					cnameParams.OldRecordType = "CNAME";
					cnameParams.OldRecordValue = "";
					cnameParams.OldRecordTTL = 3600;
					response = await domainProviderApiClient.request(
						"ModifyDNSRecord",
						cnameParams,
						null,
						provider
					);
				} else {
					// Add
					response = await domainProviderApiClient.request(
						"AddDNSRecord",
						cnameParams,
						null,
						provider
					);
					if (
						response?.responseMsg?.statusCode === 872 ||
						response?.code === 872
					) {
						await domainProviderApiClient.request(
							"ManageDNSRecords",
							{ WebsiteName: domainName, WebsiteId: websiteId },
							null,
							provider
						);
						response = await domainProviderApiClient.request(
							"AddDNSRecord",
							cnameParams,
							null,
							provider
						);
					}
				}
			} else {
				// ConnectReseller: always CNAME for subdomain
				const cnameParams = {
					DNSZoneID: websiteId,
					RecordName: cnameName,
					RecordType: "CNAME",
					RecordValue: rewrite,
					RecordTTL: 3600,
					WebsiteName: domainName,
				};
				if (dnsZoneRecordId) {
					cnameParams.DNSZoneRecordID = dnsZoneRecordId;
					cnameParams.OldRecordName = cnameName;
					cnameParams.OldRecordType = "CNAME";
					cnameParams.OldRecordValue = "";
					cnameParams.OldRecordTTL = 3600;
					response = await domainProviderApiClient.request(
						"ModifyDNSRecord",
						cnameParams,
						null,
						provider
					);
				} else {
					response = await domainProviderApiClient.request(
						"AddDNSRecord",
						cnameParams,
						null,
						provider
					);
				}
			}
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Subdomain forwarding (CNAME) handled for ${cnameName}`,
				status: "Successful",
			});
			return res.status(200).json(response);
		} catch (error) {
			await saveActivity({
				userId: req.user.id,
				domain: domainName,
				activityType: "domain",
				activity: `Subdomain forwarding (CNAME) failed for ${subDomain}.${domainName}`,
				status: "Rejected",
			});
			return res.status(500).json({
				responseMsg: {
					statusCode: 500,
					message: error.message || "Internal server error",
				},
				responseData: null,
			});
		}
	}

	async getAll(req, res) {
		let { websiteId, domainName, provider } = req.query;

		// If provider is not provided, get it from domain data
		if (!provider && domainName) {
			let domainData = await Domain.findOne({ websiteName: domainName });
			provider = domainData?.provider || "connectreseller";
		}

		try {
			let domainForwarding, subdomainForwarding;

			if (provider === "openprovider") {
				// For OpenProvider, get CNAME DNS records instead of domain forwarding
				const dnsParams = {
					WebsiteName: domainName,
					WebsiteId: websiteId,
				};

				const dnsResponse = await domainProviderApiClient.request(
					"ViewDNSRecord",
					dnsParams,
					null,
					provider
				);

				// Filter CNAME records for domain forwarding
				const cnameRecords =
					dnsResponse.responseData?.records?.filter(
						(record) => record.type === "CNAME"
					) || [];

				// Separate domain-level and subdomain CNAME records
				const domainCnames = cnameRecords.filter(
					(record) =>
						record.name === domainName || record.name === "@"
				);
				const subdomainCnames = cnameRecords.filter(
					(record) =>
						record.name !== domainName && record.name !== "@"
				);

				domainForwarding = {
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: 200,
						message: "Success",
					},
					responseData: domainCnames,
				};

				subdomainForwarding = {
					responseMsg: {
						id: 0,
						reason: null,
						statusCode: 200,
						message: "Success",
					},
					responseData: subdomainCnames,
				};
			} else {
				// For ConnectReseller, use the original domain forwarding API calls
				domainForwarding = await domainProviderApiClient.request(
					"GetDomainForwarding",
					{ websiteId },
					null,
					provider
				);
				subdomainForwarding = await domainProviderApiClient.request(
					"GetSubDomainForwardingList",
					{ websiteId },
					null,
					provider
				);
			}

			return res
				.status(200)
				.json({ domainForwarding, subdomainForwarding });
		} catch (error) {
			console.error("Error in getAll function:", error);
			return res.status(500).json({
				responseMsg: {
					id: 0,
					reason: null,
					statusCode: 500,
					message: error.message || "Internal server error",
				},
				responseData: null,
			});
		}
	}
}

module.exports = new DomainForwardController();
