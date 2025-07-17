const SSHKey = require("../models/SSHKeys");
const cryptr = require("../services/cryptr");

// Add SSH keys data
async function getSSHDataMiddleware(req, res, next) {
	try {
		const user = req.user;
		const userId = user._id;
		const { sshKeyName } = req.body;
		const sshKeyDetails = await SSHKey.findOne({ userId, sshKeyName });
		if (!sshKeyDetails) {
			return res
				.status(404)
				.json({ message: "SSH key not found.", success: false });
		}
		req.userId = userId;
		req.sshKeyDetails = {
			...sshKeyDetails._doc,
			privateKey: cryptr.decrypt(sshKeyDetails.privateKey),
		};
		next();
	} catch (error) {
		const ErrorHandler = require('../utils/errorHandler');
		ErrorHandler.logError(error, {
			type: 'ssh_key_fetch_error',
			sshKeyName,
			userId: req.user?.id
		});
		
		const errorResponse = ErrorHandler.createErrorResponse(error, {
			customMessage: "Failed to fetch SSH key details"
		});
		
		return res.status(500).json(errorResponse);
	}
}

module.exports = { getSSHDataMiddleware };
