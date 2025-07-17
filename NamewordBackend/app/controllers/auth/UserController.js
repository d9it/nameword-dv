const NotFoundError = require("../../errors/NotFoundError");
const User = require("../../models/User");
const { hmacHash, strRandom } = require('../../utils/common');
const transporter = require("../../services/mailer");
const env = require("../../../start/env");
const nunjucks = require("nunjucks");
const RequestValidationError = require("../../errors/RequestValidationError");
const moment = require("moment");
const ReactivateAccountToken = require("../../models/ReactivateAccountToken");
const ForbiddenError = require("../../errors/ForbiddenError");
const { uploadFile, getSignedURL, deleteFile } = require("../../utils/gCloudStorage");
const fs = require("fs")

class UserController {
	async changePassword(req, res) {
		const { oldPassword, newPassword } = req.body;
		const user = await User.findById(req.user.id);
		
		// Verify old password
		const isPasswordMatch = await user.isValidPassword(oldPassword);
		if (!isPasswordMatch) {
			return res.status(400).json({ message: "Incorrect password." });
		}

		// Check if new password is same as old password
		const isNewPasswordSame = await user.isValidPassword(newPassword);
		if (isNewPasswordSame) {
			return res.status(400).json({ message: "New password must be different from current password." });
		}

		try {
			// Set IP and user agent for password history
			user.ipAddress = req.ip;
			user.userAgent = req.get('User-Agent');
			user.password = newPassword;
			await user.save();
			
			return res.status(200).json({ message: "Your Password has been updated." });
		} catch (error) {
			return res.status(400).json({ message: error.message });
		}
	}

	async deactivateAccount(req, res) {
		const user = await User.findById(req.user.id);
		user.deactivated = true;
		await user.save();
		delete req.session.jwt;
		return res
			.status(200)
			.json({
				message: "Your Account has been deactivated temporarily.",
			});
	}

    async sendReactivateAccountLink(req, res) {
        const { email } = req.body;
        const user = await User.findOne({email});
        if(!user){
            throw new NotFoundError("Email does not exists!");
        }
        if (!user.deactivated) {
			throw new RequestValidationError([{ type:"field", path:"email", msg:"This email is already activated." }]);
        }
        await ReactivateAccountToken.deleteOne({email: user.email});
        const randomString = strRandom();
        const token =hmacHash(randomString);
        await ReactivateAccountToken.create({
            email, token
        });
        let url = env.FRONTEND_URL+"/reactivate-account/"+token+"?email="+user.email;
        let html = nunjucks.render('mails/reactivate_account.html',{url});
        const info = await transporter.sendMail({
            from: env.MAIL_FROM_ADDRESS,
            to: user.email, 
            subject: "Reactivate Account Notification", 
            html: html, // html body
        });
        return res.status(200).json({message:"We have emailed you a reactivate link!"});
    }

    async reactivateAccount(req, res) {
        const { email, token } = req.body;
		let result = await ReactivateAccountToken.findOne({email, token});

		if(result){
			let newDate = moment(result.createdAt).add(60, 'minutes');
			const now = moment();
    		const isInPast = newDate.isBefore(now);
			if(isInPast){
				throw new RequestValidationError([{ type:"field", path:"email", msg:"This reactivate account token is invalid." }]);
			}
	
			let user = await User.findOne({email:result.email});
			if(user){
				user.deactivated = false;
				await user.save();
				await result.deleteOne();
				return res.status(200).json({message:"Your account has been reactivated. Please login to continue."});
			}
		}
		throw new RequestValidationError([{ type:"field", path:"email", msg:"Couldn\'t find user with this email" }]);
    }

    async deleteUserAccount(req, res) {
		const user = await User.findById(req.user.id);
        await user.deleteOne();
		delete req.session.jwt;
		return res.status(204).send();
	}

	async updateUserDetails(req, res) {
		const {
			name,
			email,
			mobile,
			username,
			enabled2FA,
			notifySMS,
			notifyEmail,
		} = req.body;
		const user = await User.findById(req.user.id);
		const errors = [];
		if (mobile && mobile.length) {
			const checkUserWithMobile = await User.findOne({ mobile });
			if (
				checkUserWithMobile &&
				checkUserWithMobile.mobile != user.mobile
			) {
				errors.push({
					type: "field",
					path: "mobile",
					msg: "Mobile already in use",
				});
			} else {
				user.mobile = mobile;
			}
		}
		if (email && email.length) {
			const checkUserWithEmail = await User.findOne({ email });
			if (checkUserWithEmail && checkUserWithEmail.email != user.email) {
				errors.push({
					type: "field",
					path: "email",
					msg: "Email already in use",
				});
			} else {
				user.email = email;
			}
		}
		if (username && username.length) {
			const checkUser = await User.findOne({ username });
			if (checkUser && checkUser.username != user.username) {
				errors.push({
					type: "field",
					path: "otp",
					msg: "Mobile already in use",
				});
			} else {
				user.username = username;
			}
		}
		if (errors.length) {
			throw new RequestValidationError(errors);
		}
		user.name = name ? name : user.name;
		if (enabled2FA !== undefined) {
			user.enabled2FA = enabled2FA;
		}
		if (notifySMS !== undefined) {
			user.notifySMS = notifySMS;
		}
		if (notifyEmail !== undefined) {
			user.notifyEmail = notifyEmail;
		}
		await user.save();
		const userData = await user.getProfileWithSignedURL()
		return res.status(200).json({ data: userData });
	}

	async updateProfilePicture(req,res) {
		const user = await User.findById(req.user.id);
		const file = req.file
		if (!file || !file.mimetype.startsWith("image")) {
			throw new RequestValidationError([{ type:"field", path:"profileImg", msg:"Please upload an image file" }]);
		}
		if (user.profileImg) {
			await deleteFile(user.profileImg)
			user.profileImg = null
            await user.save()
		}
		const result = await uploadFile(file)
		if (result) {
			user.profileImg = result[1]?.name
			await user.save()
		}
		fs.unlinkSync(req.file.path)
		user.profileImg = await getSignedURL(user.profileImg)
		return res.status(200).json({ data: user });
	}

	async deleteProfilePicture(req,res) {
		const user = await User.findById(req.user.id);
		if (user.profileImg) {
			await deleteFile(user.profileImg)
			user.profileImg = null
            await user.save()
		}
		return res.status(200).json({ data: user });
	}
}

module.exports = new UserController();
