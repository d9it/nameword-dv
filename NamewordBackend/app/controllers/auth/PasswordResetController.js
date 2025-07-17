const NotFoundError = require('../../errors/NotFoundError');
const PasswordResetToken = require('../../models/PasswordResetToken');
const User = require('../../models/User');
const { hmacHash, strRandom } = require('../../utils/common');
const transporter = require('../../services/mailer');
const env = require('../../../start/env');
const nunjucks = require('nunjucks');
const RequestValidationError = require('../../errors/RequestValidationError');
const moment = require('moment');
const VerificationCode = require('../../models/VerificationCode');

class PasswordResetController{
	async sendResetLink(req, res){
		const { email } = req.body;
		const user = await User.findOne({email});
		if(!user){
			throw new NotFoundError("Email does not exists!");
		}
		await PasswordResetToken.deleteOne({email: user.email});
		const randomString = strRandom();
		const token =hmacHash(randomString);
		await PasswordResetToken.create({
			email, token
		});
		let url = env.FRONTEND_URL+"/password-reset/"+token+"?email="+user.email;
		let html = nunjucks.render('mails/password_reset.html',{url});
		const info = await transporter.sendMail({
			from: env.MAIL_FROM_ADDRESS,
			to: user.email, 
			subject: "Reset Password Notification", 
			html: html, // html body
		});
		return res.status(200).json({message:"We have emailed you a reset link!"});
	}

	// async resetPassword(req, res){
		
	// 	const {email, token, password} = req.body;
	// 	let result = await PasswordResetToken.findOne({email, token});

	// 	if(result){
	// 		let newDate = moment(result.createdAt).add(60, 'minutes');
	// 		const now = moment();
    // 		const isInPast = newDate.isBefore(now);
	// 		if(isInPast){
	// 			throw new RequestValidationError([{ type:"field", path:"email", msg:"This password reset token is invalid." }]);
	// 		}
	
	// 		let user = await User.findOne({email:result.email});
	// 		if(user){
	// 			user.password = password;
	// 			await user.save();
	// 			await result.deleteOne();
	// 			return res.status(200).json({message:"Your password has been reset. Please login to continue."});
	// 		}
	// 	}
	// 	throw new RequestValidationError([{ type:"field", path:"email", msg:"Couldn\'t find user with this email" }]);
	// }

	async resetPassword(req, res){
		
		const {email, otp, password } = req.body;
		let result = await VerificationCode.findOne({email, otp});

		if(result){
			const now = moment();
    		const isInPast = moment(result.expiresAt).isBefore(now);
			if(isInPast){
				throw new RequestValidationError([{ type:"field", path:"otp", msg:"The OTP has been expired. Please try again." }]);
			}
	
			let user = await User.findOne({email:result.email});
			if(user){
				try {
					// Set IP and user agent for password history
					user.ipAddress = req.ip;
					user.userAgent = req.get('User-Agent');
					user.password = password;
					await user.save();
					await result.deleteOne();
					return res.status(200).json({message:"Your password has been reset. Please login to continue."});
				} catch (error) {
					throw new RequestValidationError([{ type:"field", path:"password", msg: error.message }]);
				}
			}
		}
		throw new RequestValidationError([{ type:"field", path:"otp", msg:"The OTP is invalid or expired" }]);
	}
}

module.exports = new PasswordResetController();