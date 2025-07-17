const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const BadRequestError = require("../../errors/BadRequestError");
const { assignTierAndBadges } = require("../../utils/query");
const ForbiddenError = require("../../errors/ForbiddenError");

class LoginController {
	async login(req, res) {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			throw new BadRequestError("Email is not registered with us.");
		}
		const isValid = await user.isValidPassword(password);
		if (!isValid) {
			throw new BadRequestError("Invalid credentials");
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

			const SessionSecurity = require('../../middlewares/session-security');
	
		try {
			// Rotate session for security
			await SessionSecurity.rotateSession(req, res, user, false);
		} catch (error) {
			console.error('Session rotation failed during login:', error);
			// Continue with login even if session rotation fails
		}
	
		const userData = await user.getProfileWithSignedURL();
		return res.status(200).json({ data: userData });
	}

	async currentUser(req, res, next) {
		const user = await User.findById(req.user.id)
			.populate("membershipTier")
			.populate("badges.badge");
		let rewardPoints = await user.rewardPoints();
		let userJson = user.toJSON({ virtuals: true });
		userJson.rewardPoints = rewardPoints;
		const userData = await user.getProfileWithSignedURL();

		return res.json({ data: userData });
	}

	async logout(req, res, next) {
		const SessionSecurity = require('../../middlewares/session-security');
		return SessionSecurity.logout(req, res, next);
	}
}

module.exports = new LoginController();
