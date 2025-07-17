const NotFoundError = require("../../errors/NotFoundError");
const VerificationCode = require("../../models/VerificationCode");
const User = require("../../models/User");
const transporter = require("../../services/mailer");
const env = require("../../../start/env");
const nunjucks = require("nunjucks");
const RequestValidationError = require("../../errors/RequestValidationError");
const moment = require("moment");
const { generateRandomOtp } = require("../../utils/common");
const { twilioSendOtp, twilioMobileOtpVerify } = require("../../services/twilio");

class VerificationController {
	async sendEmailVerificationCode(req, res) {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) {
			throw new NotFoundError("Email does not exists!");
		}
		await VerificationCode.deleteOne({ email: user.email });
		const { otp, expiresAt } = generateRandomOtp();
		await VerificationCode.create({
			email,
			otp,
			expiresAt,
		});
		let html = nunjucks.render("mails/verification_code.html", { otp });
		const info = await transporter.sendMail({
			from: env.MAIL_FROM_ADDRESS,
			to: user.email,
			subject: "Email verification notification",
			html: html, // html body
		});
		return res.status(200).json({ message: "We have emailed you otp!" });
	}

	async verifyEmailVerificationCode(req, res) {
		const { email, otp } = req.body;
		const result = await VerificationCode.findOne({
			email: email,
			otp: otp,
		});
		const user = await User.findOne({ email });
		if (!result) {
		    throw new RequestValidationError([{ type:"field", path:"otp", msg:"The OTP is invalid or expired." }]);
        }
        const now = moment()
        const isOtpExpired = moment(result.expiresAt).isBefore(now)
        if(isOtpExpired){
            throw new RequestValidationError([{ type:"field", path:"otp", msg:"This OTP is invalid or expired. Please try again" }]);
        }
		user.isProfileVerified = true
		await user.save()
        return res.status(200).json({ data: {message: "Email verified successfully!", isVerified: true} });
	}

	async sendMobileOTP(req, res) {
		const { mobile } = req.body;
		const user = await User.findOne({ mobile });

		if (!user) {
			throw new NotFoundError("User does not exists!");
		}

        const result = await twilioSendOtp(mobile);

        if (!result.success) {
            return res.status(500).json({ success: false, message: result.error });
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            status: result.status,
        });
    }

	async verifyMobileOTP(req, res) {
		const { mobile, otp } = req.body;

		const user = await User.findOne({ mobile });

		if (!user) {
			throw new NotFoundError("User does not exists!");
		}

        const result = await twilioMobileOtpVerify(mobile, otp);
        if (!result.success) {
            return res.status(500).json({ success: false, message: result.error });
        }

        return res.status(200).json({
            success: true,
            message: "OTP verify successfully",
            status: result.status,
        });
    }
}

module.exports = new VerificationController();
