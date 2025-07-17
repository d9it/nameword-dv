const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const VerificationCode = require("../../models/VerificationCode");
const transporter = require("../../services/mailer");
const env = require("../../../start/env");
const nunjucks = require("nunjucks");
const { generateRandomOtp } = require("../../utils/common");
const { uploadFile, getSignedURL } = require("../../utils/gCloudStorage");
const {
	createClientOnBothProviders,
} = require("../../services/domainProviderClient");
const {
	RequestValidationError,
} = require("../../errors/RequestValidationError");
const fs = require("fs");

class RegisterController {
	async register(req, res, next) {
		try {
			let profileImgPath = null;
			const file = req.file;
			if (file && !file.mimetype.startsWith("image")) {
				throw new RequestValidationError([
					{
						type: "field",
						path: "profileImg",
						msg: "Please upload an image file",
					},
				]);
			}
			if (file) {
				const uploadResult = await uploadFile(file);
				if (uploadResult) {
					profileImgPath = uploadResult[1]?.name;
				}
				fs.unlinkSync(req.file.path);
			}

			// Create user with profile image
			const userPayload = {
				...req.body,
				...(profileImgPath && { profileImg: profileImgPath }),
			};
			let user = await User.create(userPayload);

			// Create client on domain providers
			try {
				const clientData = {
					FirstName: user.name.split(" ")[0] || user.name,
					LastName: user.name.split(" ").slice(1).join(" ") || "",
					UserName: user.email,
					Password:
						req.body.password ||
						Math.random().toString(36).slice(-8),
					CompanyName: req.body.companyName || "Individual",
					Address1: req.body.address || "Not provided",
					City: req.body.city || "Not provided",
					StateName: req.body.state || "Not provided",
					CountryName: req.body.country || "US",
					Zip: req.body.zip || "00000",
					PhoneNo_cc: req.body.phoneCountryCode || "+1",
					PhoneNo: req.body.mobile || req.body.phone || "0000000000",
					Faxno_cc: req.body.faxCountryCode || "",
					FaxNo: req.body.fax || "",
					Alternate_Phone_cc:
						req.body.alternatePhoneCountryCode || "",
					Alternate_Phone: req.body.alternatePhone || "",
					Id: user._id.toString(),
					email: user.email,
				};

				const clientResponse = await createClientOnBothProviders(
					clientData
				);

				if (clientResponse.length > 0) {
					clientResponse.forEach(async (client) => {
						if (client.provider && client.responseData) {
							user.domainProviderClient[client.provider] = {
								clientId:
									client.responseData.clientId ||
									client.responseData.id ||
									client.responseData.customerId,
								username: clientData.UserName,
							};
						}
					});
				}

				await user.save();
			} catch (clientError) {
				console.error(
					"Failed to create domain provider client:",
					clientError
				);
			}

			const { otp, expiresAt } = generateRandomOtp();
			await VerificationCode.create({
				email: user.email,
				otp,
				expiresAt,
			});
			const profileUrl = await getSignedURL(profileImgPath);
			user.profileImg = profileUrl;
			let html = nunjucks.render("mails/verification_code.html", { otp });
			const info = await transporter.sendMail({
				from: env.MAIL_FROM_ADDRESS,
				to: user.email,
				subject: "Email verification notification",
				html: html, // html body
			});
			return res.status(201).json({ data: user });
		} catch (err) {
			next(err);
		}
	}

	async registerTelegramUser(req, res) {
		try {
			const { telegramId, name, email } = req.body;
			let user = await User.findOne({ telegramId: telegramId });
			if (!user) {
				user = await User.create({
					name: name ?? email,
					telegramId,
					email,
					banned: false,
				});

				// Create client on domain providers
				try {
					const clientData = {
						FirstName: user.name.split(" ")[0] || user.name,
						LastName: user.name.split(" ").slice(1).join(" ") || "",
						UserName: user.email,
						Password:
							req.body.password ||
							Math.random().toString(36).slice(-8),
						CompanyName: req.body.companyName || "Individual",
						Address1: req.body.address || "Not provided",
						City: req.body.city || "Not provided",
						StateName: req.body.state || "Not provided",
						CountryName: req.body.country || "US",
						Zip: req.body.zip || "00000",
						PhoneNo_cc: req.body.phoneCountryCode || "+1",
						PhoneNo:
							req.body.mobile || req.body.phone || "0000000000",
						Faxno_cc: req.body.faxCountryCode || "",
						FaxNo: req.body.fax || "",
						Alternate_Phone_cc:
							req.body.alternatePhoneCountryCode || "",
						Alternate_Phone: req.body.alternatePhone || "",
						Id: user._id.toString(),
						email: user.email,
					};

					const clientResponse = await createClientOnBothProviders(
						clientData
					);

					if (clientResponse.length > 0) {
						clientResponse.forEach(async (client) => {
							if (client.provider && client.responseData) {
								user.domainProviderClient[client.provider] = {
									clientId:
										client.responseData.clientId ||
										client.responseData.id ||
										client.responseData.customerId,
									username: clientData.UserName,
								};
							}
						});
					}

					await user.save();
				} catch (clientError) {
					console.error(
						"Failed to create domain provider client:",
						clientError
					);
				}
			} else {
				return res.status(400).json({ error: "User already exists" });
			}
			const SessionSecurity = require('../../middlewares/session-security');
            
            try {
                // Rotate session for security
                await SessionSecurity.rotateSession(req, res, user, false);
            } catch (error) {
                console.error('Session rotation failed during Telegram registration:', error);
                // Continue with registration even if session rotation fails
            }
			return res.status(201).json({ data: user });
		} catch (err) {
			return res.status(500).json({
				message: "Something went wrong!",
				details: err.message,
			});
		}
	}
}

module.exports = new RegisterController();
