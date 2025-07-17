const axios = require("axios");
const schedule = require('node-schedule');
const winston = require("winston");

const CpanelAccount = require('../models/hosting/CpanelAccount');
const PleskAccount = require('../models/hosting/PleskAccount');

const { deletePleskAccount } = require("../utils/hosting");
const { Logger } = require('../utils/logger');

const axiosInstance = axios.create({
	baseURL: process.env.WHM_SERVER_URL,
	headers: {
		Authorization: `whm ${process.env.WHM_USERNAME}:${process.env.WHM_API_KEY}`,
	},
});

schedule.scheduleJob('*/30 * * * *', async () => {
	const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

	const accountsToDelete = await CpanelAccount.find({
		plan: 'Freedom Plan',
		createdAt: { $lte: twelveHoursAgo },
		deletedAt: { $exists: false }
	});

	if (accountsToDelete.length > 0) {
		Logger.info(`Found ${accountsToDelete.length} cPanel accounts to delete`);
	}

	for (const account of accountsToDelete) {
		try {
			await axiosInstance.get(`/json-api/removeacct?api.version=1&username=${account.username}`);
			await account.softDelete();

			Logger.info(`Deleted cPanel account for user: ${account.username}`);
		} catch (error) {
			Logger.error(`Failed to delete cPanel account for user: ${account.username}`, error);
		}
	}
});

// write a same job for Plesk instead of Cpanel
schedule.scheduleJob('*/30 * * * *', async () => {
	const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

	const accountsToDelete = await PleskAccount.find({
		plan: 'Freedom Plan',
		createdAt: { $lte: twelveHoursAgo },
		deletedAt: { $exists: false }
	});

	if (accountsToDelete.length > 0) {
		Logger.info(`Found ${accountsToDelete.length} Plesk accounts to delete`);
	}

	for (const account of accountsToDelete) {
		try {
			const { success, message } = await deletePleskAccount(account, true);

			if (success) {
				Logger.info(`Deleted Plesk account for user: ${account.username}`);
			} else {
				Logger.error(`Failed to delete Plesk account for user: ${account.username}`, message);
			}
		} catch (error) {
			Logger.error(`Failed to delete Plesk account for user: ${account.username}`, error);
		}
	}
});


Logger.info('Scheduled job to delete expired cPanel accounts is set up.');
