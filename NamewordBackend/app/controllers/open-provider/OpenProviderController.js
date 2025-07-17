const axios = require("axios");
const { Logger } = require('../../utils/logger');


const OPEN_PROVIDER_BACKEND = "https://api.openprovider.eu/v1beta"
// const OPEN_PROVIDER_BACKEND = "http://api.sandbox.openprovider.nl:8480/v1beta"

class OpenProviderController {

    static async authenticateOpenProvider() {
        try {
            Logger.info("##creds:", {
                username: process.env.OPENPROVIDER_USERNAME,
                password: process.env.OPENPROVIDER_PASSWORD,
            })
            const response = await axios.post(`${OPEN_PROVIDER_BACKEND}/auth/login`, {
                username: process.env.OPENPROVIDER_USERNAME,
                password: process.env.OPENPROVIDER_PASSWORD,
                hash: "922d8868dd9040774d2b81d6a1a89520b2edf2ee",
                ip: "0.0.0.0"
            });

            if (response.data?.data?.token) {
                Logger.info(" OpenProvider Authentication Successful.", response.data);
                return response.data.data.token;
            } else {
                throw new Error("Authentication failed: No token received.");
            }
        } catch (error) {
            Logger.error("❌ OpenProvider Authentication Error:", error.response?.data || error.message);
            throw new Error("Failed to authenticate with OpenProvider.");
        }
    }

    static async createPleskLicense({ licenseType, ipAddress }) {
        try {
            // Step 1: Authenticate and get JWT token
            const token = await OpenProviderController.authenticateOpenProvider();

            // Step 2: Call OpenProvider API to create a Plesk license
            const response = await axios.post(
                `${OPEN_PROVIDER_BACKEND}/licenses/plesk`,
                {
                    comment: "whmAdmin",
                    ip_address_binding: "1.2.3.4",

                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Step 3: Extract License Key
            if (response.data?.data?.key) {
                Logger.info("✅ Plesk License Created:", response.data.data.key);
                return response.data.data.key;
            } else {
                throw new Error("Failed to retrieve license key from OpenProvider.");
            }
        } catch (error) {
            Logger.error("❌ Error creating Plesk license:", error.response?.data || error.message);
            throw new Error("Failed to create Plesk license.");
        }
    }

    static async listOpenProviderItems({ product = "plesk", limit = 100, offset = 0 } = {}) {
        try {
            // Step 1: Authenticate and get JWT token
            const token = await OpenProviderController.authenticateOpenProvider();
            Logger.info("###token",token)
            // Step 2: Call OpenProvider API to list items
            const response = await axios.get(
                `${OPEN_PROVIDER_BACKEND}/licenses/items`,
                {
                    limit,
                    offset,
                    product: product, // "plesk", "ssl", "domain"
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // Step 3: Extract and return the list of items
            if (response.data?.data?.results) {
                Logger.info(`✅ Retrieved ${response.data.data.results.length} OpenProvider items`);
                return response.data.data.results;
            } else {
                throw new Error("No items retrieved from OpenProvider.");
            }
        } catch (error) {
            Logger.error("❌ Error fetching OpenProvider items:", error.response?.data || error.message);
            return [];
        }
    }
}

module.exports = OpenProviderController;
