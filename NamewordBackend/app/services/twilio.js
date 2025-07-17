const twilio = require("twilio");
const env = require("../../start/env");

const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

const twilioSendOtp = async (mobile) => {
	try {
		const verification = await client.verify.v2
			.services(env.TWILIO_VERIFY_SID)
			.verifications.create({ to: mobile, channel: "sms" });

		return { success: true, status: verification.status };
	} catch (error) {
		console.error("Twilio Error:", error);
		return { success: false, error: error.message };
	}
};

const twilioMobileOtpVerify = async (mobile, otp) => {
	try {
		const verificationCheck = await client.verify.v2
			.services(env.TWILIO_VERIFY_SID)
			.verificationChecks.create({
				code: otp,
				to: mobile,
			});

		if (verificationCheck?.status === "approved") {
			return { success: true, message: "OTP verified successfully!" };
		} else {
			return { success: false, error: "Invalid OTP!" };
		}
	} catch (error) {
		console.error("Twilio Verification Error:", error);
		return { success: false, error: "OTP verification failed!" };
	}
};

module.exports = { twilioSendOtp, twilioMobileOtpVerify };
