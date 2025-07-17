const apiClient = require("../../utils/apiclient");
const domainProviderApiClient = require("../../utils/domainProviderApiClient");
const { validateAndApplyFee } = require("../../services/domain");
const NotFoundError = require("../../errors/NotFoundError");
const BadRequestError = require("../../errors/BadRequestError");
const RewardPointLog = require("../../models/RewardPointLog");
const User = require("../../models/User");
const Badge = require("../../models/Badge");
const Domain = require("../../models/Domain");
const { getPriceForDomain } = require("../../utils/api");
const { startSession } = require("mongoose");
const { saveActivity } = require("../activityController");
const Cloudflare = require("cloudflare");

const cloudflare = new Cloudflare({
	apiEmail: process.env.CLOUDFLARE_EMAIL,
	apiKey: process.env.CLOUDFLARE_API_KEY,
});

class DomainController {
	async domainSearch(req, res) {
		const {
			websiteName,
			renewalFeePerc,
			transferFeePerc,
			registrationFeePerc,
		} = req.query;
		// const response = await apiClient.request('checkdomainavailable', { websiteName});
		const response = await domainProviderApiClient.request(
			"checkdomainavailable",
			{ websiteName },
			null,
			"both"
		);
		console.log(response);
		if (!response || !response.responseData) {
			return res
				.status(404)
				.json({ message: "Domain is not available for registration" });
		}
		const { renewalfee, registrationFee, transferFee } =
			response.responseData;

		response.responseData.renewalfee = validateAndApplyFee(
			renewalfee,
			renewalFeePerc,
			"Renewal fee"
		);
		response.responseData.registrationFee = validateAndApplyFee(
			registrationFee,
			registrationFeePerc,
			"Registration fee"
		);
		response.responseData.transferFee = validateAndApplyFee(
			transferFee,
			transferFeePerc,
			"Transfer fee"
		);
		return res.status(200).json(response);
	}

	async domainSuggestion(req, res) {
		let { keyword, limit = 10, provider } = req.query;
		const response = await domainProviderApiClient.request(
			"domainSuggestion",
			{ keyword, maxResult: limit },
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async domainList(req, res) {
		console.log("###DomainList", req.user);
		let user = await User.findById(req.user.id).populate("domains");
		return res.status(200).json({ data: user.domains });
	}

	async getTldSuggestion(req, res) {
		const { websiteName, provider } = req.query;
		const response = await domainProviderApiClient.request(
			"getTldSuggestion",
			{ websiteName },
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async checkDomainPrice(req, res) {
		const { websiteName, provider } = req.query;
		const response = await domainProviderApiClient.request(
			"checkDomainPrice",
			{ websiteName },
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async placeDomainOrder(req, res) {
		try {
			let {
				productType: ProductType,
				websiteName: Websitename,
				duration: Duration,
				isWhoisProtection: IsWhoisProtection,
				ns1,
				ns2,
				ns3,
				ns4,
				id: Id,
				isEnablePremium,
				provider,
				handle,
			} = req.query;
			const domainPrice = await getPriceForDomain(Websitename, Duration);

			if (!domainPrice) {
				throw new BadRequestError("Price not found!");
			}
			let user = await User.findById(req.user.id).populate(
				"membershipTier"
			);

			if (!user) {
				throw new BadRequestError("User not found");
			}

			if (user.domains.length === 0) {
				console.log("user domains not found! inset first time badge");
				let badge = await Badge.findOne({
					name: "First Domain Registration",
				});
				if (badge) {
					user.badges.push({ badge: badge._id });
				}
			}

			let cloudflareZone;
			// If provider is OpenProvider, create Cloudflare zone first
			if (provider === "openprovider") {
				try {
					// Check if zone already exists by searching through all pages
					// let existingZone = null;
					// let page = 1;
					// const perPage = 50;

					// while (true) {
					// 	const searchResponse = await cloudflare.zones.list({
					// 		page: page,
					// 		per_page: perPage,
					// 		name: Websitename
					// 	});

					// 	if (!searchResponse.result || searchResponse.result.length === 0) {
					// 		break;
					// 	}

					// 	existingZone = searchResponse.result.find(zone => zone.name === Websitename);
					// 	if (existingZone) {
					// 		break;
					// 	}

					// 	if (page >= searchResponse.result_info.total_pages) {
					// 		break;
					// 	}
					// 	page++;
					// }

					let zoneResponse;
					// if (existingZone) {
					// 	// Use existing zone
					// 	zoneResponse = existingZone;
					// 	console.log('Using existing Cloudflare zone:', zoneResponse.id);
					// } else {
					// Create new zone
					zoneResponse = await cloudflare.zones.create({
						name: Websitename,
						type: "full",
					});
					console.log(
						"Created new Cloudflare zone:",
						zoneResponse.id
					);
					// }

					// Set SSL encryption mode to 'Full'
					await cloudflare.zones.settings.edit("ssl", {
						value: "full",
						zone_id: zoneResponse.id,
					});

					// Enable 'Always use HTTPS' setting
					await cloudflare.zones.settings.edit("always_use_https", {
						value: "on",
						zone_id: zoneResponse.id,
					});

					// Store Cloudflare zone info
					cloudflareZone = {
						zoneId: zoneResponse.id,
						nameServers: zoneResponse.name_servers,
					};

					// Use Cloudflare nameservers for domain registration
					ns1 = zoneResponse.name_servers[0];
					ns2 = zoneResponse.name_servers[1];
					ns3 = null;
					ns4 = null;
				} catch (error) {
					console.error("Error setting up Cloudflare:", error);
					if (cloudflareZone) {
						console.log("cloudflareZone", cloudflareZone);
						try {
							await cloudflare.zones.delete({
								zone_id: cloudflareZone.zoneId,
							});
						} catch (error) {
							console.error(
								"Error deleting Cloudflare zone:",
								error
							);
						}
					}
					throw new Error(
						"Failed to set up Cloudflare: " + error.message
					);
				}
			}

			const response = await domainProviderApiClient.request(
				"domainorder",
				{
					ProductType,
					Websitename,
					Duration,
					IsWhoisProtection,
					ns1,
					ns2,
					ns3,
					ns4,
					Id,
					isEnablePremium,
					handle,
				},
				null,
				provider
			);

			if (response?.responseMsg?.statusCode != 200) {
				// If domain registration fails and we created a Cloudflare zone, delete it
				if (cloudflareZone) {
					try {
						await cloudflare.zones.delete({
							zone_id: cloudflareZone.zoneId,
						});
					} catch (error) {
						console.error("Error deleting Cloudflare zone:", error);
					}
				}
				throw new BadRequestError(
					response.responseMsg?.message || "Domain order failed"
				);
			}

			if (response?.responseMsg?.status === "REQ") {
				await new Promise((resolve) => setTimeout(resolve, 120000)); // Wait for 2 minutes
			}

			const domainResponse = await domainProviderApiClient.request(
				"ViewDomain",
				{
					websiteName: Websitename,
				},
				null,
				provider
			);

			if (domainResponse?.responseMsg?.statusCode != 200) {
				// If domain view fails and we created a Cloudflare zone, delete it
				if (cloudflareZone) {
					try {
						await cloudflare.zones.delete({
							zone_id: cloudflareZone.zoneId,
						});
					} catch (error) {
						console.error("Error deleting Cloudflare zone:", error);
					}
				}
				throw new BadRequestError(
					domainResponse.responseMsg?.message ||
						"Failed to view domain"
				);
			}

			let earnRate = user?.membershipTier?.benefits?.earnRate || 1;

			let rewardLog = new RewardPointLog({
				userId: user._id,
				rewardPoints: (domainPrice.price * earnRate).toFixed(2),
				operationType: "credit",
			});

			let domain = new Domain({
				user: user._id,
				domainNameId: domainResponse.responseData.domainNameId,
				customerId: domainResponse.responseData.customerId,
				websiteName: domainResponse.responseData.websiteName,
				orderDate: domainResponse.responseData.orderDate,
				expirationDate: domainResponse.responseData.expirationDate,
				price: domainPrice.price,
				provider: provider,
				websiteId: null,
				cloudflare: cloudflareZone,
			});

			user.domains.push(domain);

			try {
				await Promise.all([
					user.save(),
					rewardLog.save(),
					domain.save(),
				]);
			} catch (error) {
				// If saving fails and we created a Cloudflare zone, delete it
				if (cloudflareZone) {
					try {
						await cloudflare.zones.delete({
							zone_id: cloudflareZone.zoneId,
						});
					} catch (deleteError) {
						console.error(
							"Error deleting Cloudflare zone:",
							deleteError
						);
					}
				}
				throw new Error("Failed to save data: " + error.message);
			}

			// Log domain registration activity
			try {
				await saveActivity({
					userId: user._id,
					domain: domain.websiteName,
					activityType: "domain",
					activity: "Domain Registration",
					status: "Successful",
				});
			} catch (activityError) {
				console.error(
					"Failed to log domain registration activity:",
					activityError
				);
			}

			return res.status(200).json(response);

			// return res.status(200).json({
			// 	message: "Domain registered successfully",
			// 	data: {
			// 		domain: domain,
			// 		cloudflare: cloudflareZone
			// 	}
			// });
		} catch (error) {
			console.log("error", error);
			return res.status(error.status || 500).json({
				message: error.message || "Internal server error",
			});
		}
	}

	async placeTldDomainOrder(req, res) {
		try {
			const {
				productType: ProductType,
				websiteName: Websitename,
				duration: Duration,
				isWhoisProtection: IsWhoisProtection,
				ns1,
				ns2,
				ns3,
				ns4,
				id: Id,
				isEnablePremium,
				isUs,
				appPurpose,
				nexusCategory,
				handle,
				provider,
			} = req.query;

			const domainPrice = await getPriceForDomain(Websitename, Duration);
			if (!domainPrice) {
				throw new BadRequestError("Price not found!");
			}

			let user = await User.findById(req.user.id).populate(
				"membershipTier"
			);
			if (!user) {
				throw new BadRequestError("User not found");
			}

			if (!user.domainPurchased) {
				let badge = await Badge.findOne({
					name: "First Domain Registration",
				});
				if (badge) {
					user.badges.push({ badge: badge._id });
					user.domainPurchased = true;
				}
			}

			if (provider === "openprovider") {
				try {
					const params = {
						WebsiteName: Websitename,
					};
					const response = await domainProviderApiClient.get(
						"ManageDNSRecords",
						params,
						provider
					);
					console.log("response", response);
				} catch (error) {
					throw new Error(
						"Failed to manage DNS records: " + error.message
					);
				}
			}

			const response = await domainProviderApiClient.request(
				"domainorder",
				{
					ProductType,
					Websitename,
					Duration,
					IsWhoisProtection,
					ns1,
					ns2,
					ns3,
					ns4,
					Id,
					isEnablePremium,
					isUs,
					appPurpose,
					nexusCategory,
					handle,
				},
				null,
				provider
			);

			if (response?.responseMsg?.statusCode != 200) {
				throw new BadRequestError(
					response.responseMsg?.message || "Domain order failed"
				);
			}

			const domainResponse = await domainProviderApiClient.request(
				"ViewDomain",
				{
					websiteName: Websitename,
					domainId:
						response.responseData?.domainCreateResponse?.domainId ||
						null,
				},
				null,
				provider
			);

			if (domainResponse?.responseMsg?.statusCode != 200) {
				throw new BadRequestError(
					domainResponse.responseMsg?.message ||
						"Failed to view domain"
				);
			}

			let earnRate = user?.membershipTier?.benefits?.earnRate || 1;
			let rewardLog = new RewardPointLog({
				userId: user._id,
				rewardPoints: (domainPrice.price * earnRate).toFixed(2),
				operationType: "credit",
			});

			let domain = new Domain({
				user: user._id,
				domainNameId: domainResponse.responseData.domainNameId,
				customerId: domainResponse.responseData.customerId,
				websiteName: domainResponse.responseData.websiteName,
				orderDate: domainResponse.responseData.orderDate,
				expirationDate: domainResponse.responseData.expirationDate,
				price: domainPrice.price,
				provider: provider,
			});

			user.domains.push(domain);

			try {
				await Promise.all([
					user.save(),
					rewardLog.save(),
					domain.save(),
				]);
			} catch (error) {
				throw new Error("Failed to save data: " + error.message);
			}

			// Log TLD domain registration activity
			try {
				await saveActivity({
					userId: user._id,
					domain: domain.websiteName,
					activityType: "domain",
					activity: "TLD Domain Registration",
					status: "Successful",
				});
			} catch (activityError) {
				console.error(
					"Failed to log TLD domain registration activity:",
					activityError
				);
			}

			return res.status(200).json(response);
		} catch (error) {
			return res.status(error.status || 500).json({
				message: error.message || "Internal server error",
			});
		}
	}
	async domainTransfer(req, res) {
		const {
			orderType: OrderType,
			websiteName: Websitename,
			isWhoisProtection: IsWhoisProtection,
			authCode: AuthCode,
			id: Id,
		} = req.query;
		//change
		const response = await apiClient.request("TransferOrder", {
			OrderType,
			Websitename,
			IsWhoisProtection,
			AuthCode,
			Id,
		});

		// Log domain transfer activity
		try {
			const domain = await Domain.findOne({ websiteName: Websitename });
			if (domain) {
				await saveActivity({
					userId: req.user.id,
					domain: domain.websiteName,
					activityType: "domain",
					activity: "Domain Transfer Initiated",
					status:
						response?.responseMsg?.statusCode === 200
							? "Successful"
							: "Rejected",
				});
			}
		} catch (activityError) {
			console.error(
				"Failed to log domain transfer activity:",
				activityError
			);
		}

		return res.status(200).json(response);
	}

	async domainCancelTransfer(req, res) {
		const { id } = req.query;
		const requiredParams = [
			{ name: "id", value: id, message: "id is required" },
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const params = {
				id: id,
			};
			//change
			const response = await apiClient.get("CancelTransfer", params);

			// Log domain transfer cancellation activity
			try {
				const domain = await Domain.findById(id);
				if (domain) {
					await saveActivity({
						userId: req.user.id,
						domain: domain.websiteName,
						activityType: "domain",
						activity: "Domain Transfer Cancelled",
						status:
							response?.responseMsg?.statusCode === 200
								? "Successful"
								: "Rejected",
					});
				}
			} catch (activityError) {
				console.error(
					"Failed to log domain transfer cancellation activity:",
					activityError
				);
			}

			return res.status(200).json(response);
		} catch (error) {
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res.status(500).json({
					message: "Error cancelling domain transfer order",
				});
			}
		}
	}

	async domainValidateTransfer(req, res) {
		const { domainName } = req.query;
		const requiredParams = [
			{
				name: "domainName",
				value: domainName,
				message: "domainName is required",
			},
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const params = {
				domainName: domainName,
			};
			//change
			const response = await apiClient.get("syncTransfer", params);

			return res.status(200).json(response);
		} catch (error) {
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res.status(500).json({
					message: "Error cancelling domain transfer order",
				});
			}
		}
	}

	async domainRenew(req, res) {
		const {
			orderType: OrderType,
			websiteName: Websitename,
			isWhoisProtection: IsWhoisProtection,
			duration: Duration,
			id: Id,
		} = req.query;
		const domainPrice = await getPriceForDomain(Websitename, Duration);
		if (!domainPrice) {
			throw new BadRequestError("Price not found!");
		}
		let user = await User.findById(req.user.id).populate("membershipTier");
		const response = await apiClient.request("RenewalOrder", {
			OrderType,
			Websitename,
			Duration,
			IsWhoisProtection,
			Id,
		});
		//console.log(response);
		if (response?.responseMsg?.statusCode != 200) {
			throw new BadRequestError(response.responseMsg?.message);
		}

		let earnRate = user.membershipTier.benefits.earnRate;
		let rewardLog = new RewardPointLog({
			userId: user._id,
			rewardPoints: (domainPrice.price * earnRate).toFixed(2),
			operationType: "credit",
		});
		await rewardLog.save();

		// Log domain renewal activity
		try {
			const domain = await Domain.findOne({ websiteName: Websitename });
			if (domain) {
				await saveActivity({
					userId: user._id,
					domain: domain.websiteName,
					activityType: "domain",
					activity: "Domain Renewal",
					status:
						response?.responseMsg?.statusCode === 200
							? "Successful"
							: "Rejected",
				});
			}
		} catch (activityError) {
			console.error(
				"Failed to log domain renewal activity:",
				activityError
			);
		}

		return res.status(200).json(response);
	}

	async modifyNameserver(req, res) {
		const {
			domainNameId,
			websiteName,
			nameServer1,
			nameServer2,
			nameServer3,
			nameServer4,
			nameServer5,
			nameServer6,
			nameServer7,
			nameServer8,
			nameServer9,
			nameServer10,
			nameServer11,
			nameServer12,
			nameServer13,
			provider,
		} = req.query;

		const requiredParams = [
			{
				name: "domainNameId",
				value: domainNameId,
				message: "domainNameId is required",
			},
			{
				name: "websiteName",
				value: websiteName,
				message: "websiteName (domain) is required",
			},
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const params = {
				domainNameId,
				websiteName,
				nameServer1,
				nameServer2,
				nameServer3,
				nameServer4,
				nameServer5,
				nameServer6,
				nameServer7,
				nameServer8,
				nameServer9,
				nameServer10,
				nameServer11,
				nameServer12,
				nameServer13,
			};
			const response = await domainProviderApiClient.get(
				"UpdateNameServer",
				params,
				provider
			);

			// Log nameserver modification activity
			try {
				const domain = await Domain.findOne({ websiteName });
				if (domain) {
					await saveActivity({
						userId: req.user.id,
						domain: domain.websiteName,
						activityType: "domain",
						activity: "Nameserver Modification",
						status:
							response?.responseMsg?.statusCode === 200
								? "Successful"
								: "Rejected",
					});
				}
			} catch (activityError) {
				console.error(
					"Failed to log nameserver modification activity:",
					activityError
				);
			}

			return res.status(200).json(response);
		} catch (error) {
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res
					.status(500)
					.json({ message: "Error in modifying domain nameserver" });
			}
		}
	}

	async modifyAuthcode(req, res) {
		const { domainNameId, websiteName, authCode, provider } = req.query;

		const requiredParams = [
			{
				name: "domainNameId",
				value: domainNameId,
				message: "domainNameId is required",
			},
			{
				name: "websiteName",
				value: websiteName,
				message: "websiteName (domain) is required",
			},
			{
				name: "authCode",
				value: authCode,
				message: "authCode is required",
			},
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const params = {
				domainNameId,
				websiteName,
				authCode,
			};
			const response = await domainProviderApiClient.get(
				"updateAuthCode",
				params,
				null,
				provider
			);

			// Log authcode modification activity
			try {
				const domain = await Domain.findOne({ websiteName });
				if (domain) {
					await saveActivity({
						userId: req.user.id,
						domain: domain.websiteName,
						activityType: "domain",
						activity: "Authcode Modification",
						status:
							response?.responseMsg?.statusCode === 200
								? "Successful"
								: "Rejected",
					});
				}
			} catch (activityError) {
				console.error(
					"Failed to log authcode modification activity:",
					activityError
				);
			}

			return res.status(200).json(response);
		} catch (error) {
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res
					.status(500)
					.json({ message: "Error in modifying domain authcode" });
			}
		}
	}

	async manageDomainLock(req, res) {
		const { domainNameId, websiteName, isDomainLocked, provider } =
			req.query;

		const requiredParams = [
			{
				name: "domainNameId",
				value: domainNameId,
				message: "domainNameId is required",
			},
			{
				name: "websiteName",
				value: websiteName,
				message: "websiteName (domain) is required",
			},
			{
				name: "isDomainLocked",
				value: isDomainLocked,
				message: "isDomainLocked is required",
			},
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const params = {
				domainNameId,
				websiteName,
				isDomainLocked,
			};
			const response = await domainProviderApiClient.get(
				"ManageDomainLock",
				params,
				provider
			);

			// Log domain lock management activity
			try {
				const domain = await Domain.findOne({ websiteName });
				if (domain) {
					const lockStatus =
						isDomainLocked === "true" ? "Locked" : "Unlocked";
					await saveActivity({
						userId: req.user.id,
						domain: domain.websiteName,
						activityType: "domain",
						activity: `Domain ${lockStatus}`,
						status:
							response?.responseMsg?.statusCode === 200
								? "Successful"
								: "Rejected",
					});
				}
			} catch (activityError) {
				console.error(
					"Failed to log domain lock management activity:",
					activityError
				);
			}

			return res.status(200).json(response);
		} catch (error) {
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res
					.status(500)
					.json({ message: "Error in modifying domain lock" });
			}
		}
	}

	async manageDomainPrivacy(req, res) {
		const { domainNameId, iswhoisprotected, provider } = req.query;

		const requiredParams = [
			{
				name: "domainNameId",
				value: domainNameId,
				message: "domainNameId is required",
			},
			{
				name: "iswhoisprotected",
				value: iswhoisprotected,
				message: "iswhoisprotected is required",
			},
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const params = {
				domainNameId,
				iswhoisprotected,
			};

			const response = await domainProviderApiClient.get(
				"ManageDomainPrivacyProtection",
				params,
				provider
			);

			// Log domain privacy management activity
			try {
				const domain = await Domain.findOne({ domainNameId });
				if (domain) {
					const privacyStatus =
						iswhoisprotected === "true" ? "Enabled" : "Disabled";
					await saveActivity({
						userId: req.user.id,
						domain: domain.websiteName,
						activityType: "domain",
						activity: `Privacy Protection ${privacyStatus}`,
						status:
							response?.responseMsg?.statusCode === 200
								? "Successful"
								: "Rejected",
					});
				}
			} catch (activityError) {
				console.error(
					"Failed to log domain privacy management activity:",
					activityError
				);
			}

			return res.status(200).json(response);
		} catch (error) {
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res
					.status(500)
					.json({ message: "Error in modifying domain privacy" });
			}
		}
	}

	async viewSecretKey(req, res) {
		const { domainNameId, provider } = req.query;

		const requiredParams = [
			{
				name: "domainNameId",
				value: domainNameId,
				message: "domainNameId is required",
			},
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const params = {
				domainNameId,
			};
			const response = await domainProviderApiClient.get(
				"ViewEPPCode",
				params,
				provider
			);

			return res.status(200).json(response);
		} catch (error) {
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res
					.status(500)
					.json({ message: "Error in view secret key" });
			}
		}
	}

	async manageDnsRecords(req, res) {
		const { websiteId, domain, provider } = req.query;

		const requiredParams = [
			{ name: "domain", value: domain, message: "domain is required" },
			{
				name: "websiteId",
				value: websiteId,
				message: "websiteId is required",
			},
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const detail = await domainProviderApiClient.request(
				"ViewDomain",
				{ websiteName: domain, domainId: websiteId },
				null,
				provider
			);
			const id = detail.responseData.websiteId;
			const params = {
				WebsiteName: domain,
				WebsiteId: id,
			};
			const response = await domainProviderApiClient.get(
				"ManageDNSRecords",
				params,
				provider
			);

			// Log DNS management activity
			try {
				await saveActivity({
					userId: req.user.id,
					domain: domain,
					activityType: "dns",
					activity: "DNS Management Enabled",
					status:
						response?.responseMsg?.statusCode === 200
							? "Successful"
							: "Rejected",
				});
			} catch (activityError) {
				console.error(
					"Failed to log DNS management activity:",
					activityError
				);
			}

			return res.status(200).json(response);
		} catch (error) {
			console.log(error);
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error placing domain order",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res.status(500).json({
					message: error.message || "Error in manage dns records",
				});
			}
		}
	}
	async viewDomain(req, res) {
		let { domain, provider } = req.query;

		// let user = await User.findById(req.user.id).populate("membershipTier");
		let domainData = await Domain.findOne({ websiteName: domain });
		provider = domainData?.provider || "connectreseller";

		const requiredParams = [
			{ name: "domain", value: domain, message: "domain is required" },
		];

		for (let param of requiredParams) {
			if (!param.value) {
				return res.status(400).json({ message: param.message });
			}
		}

		try {
			const detail = await domainProviderApiClient.request(
				"ViewDomain",
				{ websiteName: domain },
				null,
				provider
			);
			console.log("detail =======>", detail);
			return res.status(200).json(detail);
		} catch (error) {
			console.log(error);
			if (error.response) {
				return res.status(error.response.status).json({
					message:
						error.response.data.message ||
						"Error getting domain information",
				});
			} else if (error.request) {
				return res
					.status(500)
					.json({ message: "No response received from the API" });
			} else {
				return res.status(500).json({
					message: error.message || "Error in view domain",
				});
			}
		}
	}
}

module.exports = new DomainController();
