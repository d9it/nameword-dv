const apiClient = require("../../utils/apiclient");
const domainProviderApiClient = require("../../utils/domainProviderApiClient");

class HostController {
	async addChildNameServer(req, res, next) {
		const { domainNameId, websiteName, hostName, ipAddress, provider } =
			req.query;

		const detail = await domainProviderApiClient.request(
			"ViewDomain",
			{ websiteName, domainId: domainNameId },
			null,
			provider
		);

		console.log("detail =============>", detail);
		let nameServer = [];
		if (!provider || provider == "openprovider") {
			nameServer = detail.responseData.nameServers;
			nameServer.push({
				ip: ipAddress,
				name: hostName,
			});
		}

		console.log("nameServer =============>", nameServer);
		const response = await domainProviderApiClient.request(
			"AddChildNameServer",
			{
				domainNameId,
				websiteName,
				hostName,
				ipAddress,
				nameServer,
			},
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async modifyChildNameServerIP(req, res, next) {
		const {
			domainNameId,
			websiteName,
			hostName,
			newIpAddress,
			oldIpAddress,
			provider,
		} = req.query;

		const detail = await domainProviderApiClient.request(
			"ViewDomain",
			{ websiteName, domainId: domainNameId },
			null,
			provider
		);

		let nameServer = [];
		if (!provider || provider == "openprovider") {
			nameServer = detail.responseData.nameServers;
			nameServer = nameServer.map((ns) => {
				if (ns?.ip === oldIpAddress && ns?.name === hostName) {
					return { ...ns, ip: newIpAddress };
				}
				return ns;
			});
		}

		const response = await domainProviderApiClient.request(
			"ModifyChildNameServerIP",
			{
				domainNameId,
				websiteName,
				hostName,
				newIpAddress,
				oldIpAddress,
				nameServer,
			},
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async modifyChildNameServerHost(req, res, next) {
		const {
			domainNameId,
			websiteName,
			oldHostName,
			newHostName,
			provider,
		} = req.query;

		const detail = await domainProviderApiClient.request(
			"ViewDomain",
			{ websiteName, domainId: domainNameId },
			null,
			provider
		);

		let nameServer = [];
		if (!provider || provider == "openprovider") {
			nameServer = detail.responseData.nameServers;
			nameServer = nameServer.map((ns) => {
				if (ns?.name === oldHostName) {
					return { ...ns, name: newHostName };
				}
				return ns;
			});
		}

		const response = await domainProviderApiClient.request(
			"ModifyChildNameServerHost",
			{
				domainNameId,
				websiteName,
				oldHostName,
				newHostName,
				nameServer,
			},
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async deleteChildNameServer(req, res, next) {
		const { domainNameId, websiteName, hostName, provider } = req.query;

		const detail = await domainProviderApiClient.request(
			"ViewDomain",
			{ websiteName, domainId: domainNameId },
			null,
			provider
		);

		let nameServer = [];
		if (!provider || provider == "openprovider") {
			nameServer = detail.responseData.nameServers;
			nameServer = nameServer.filter((ns) => ns?.name !== hostName);
		}

		const response = await domainProviderApiClient.request(
			"DeleteChildNameServer",
			{
				domainNameId,
				websiteName,
				hostName,
				nameServer,
			},
			null,
			provider
		);
		return res.status(200).json(response);
	}

	async getChildNameServer(req, res, next) {
		const { domainNameId, provider } = req.query;

		const response = await domainProviderApiClient.request(
			"getchildnameservers",
			{
				id: domainNameId,
			},
			null,
			provider
		);
		return res.status(200).json(response);
	}
}

module.exports = new HostController();
