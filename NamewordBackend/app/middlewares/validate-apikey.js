const NotAuthorizedError = require("../errors/NotAuthorizedError");
const { hmacHash, sessionizeUser } = require("../utils/common");
const User = require("../models/User");
const ForbiddenError = require("../errors/ForbiddenError");

const validateAPIKey = async (req, res, next) => {
	let token = req.headers["x-api-key"];
	// Removed debug logging for security
	if (!token) {
		return next();
	}

	let [userId, apiKey] = token.split("|");
	if (!userId || !apiKey) {
		return next();
	}
	let tokenHash = hmacHash(apiKey);

	const user = await User.findById(userId).select("-password").populate({
		path: "apiKeys",
		match: { tokenHash },
	});
	if (!user) {
		return next();
	}
	if (user.apiKeys.length === 0) {
		return next();
	}
	if (user.banned) {
		throw new ForbiddenError(
			"Your account has been banned. Please contact support for further assistance."
		);
	}
	if (user.deactivated) {
		throw new ForbiddenError(
			"Your account has been deactivated. Please contact support for further assistance."
		);
	}
	req.user = sessionizeUser(user);
	next();
};

module.exports = validateAPIKey;
