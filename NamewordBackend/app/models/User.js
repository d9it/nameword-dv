const mongoose = require("mongoose");
const { Schema } = mongoose;
const { hash, compare } = require("bcrypt");
const { assignTierAndBadges } = require("../utils/query");
const userBadgeSchema = require("./UserBadge");
const mongoosePaginate = require("mongoose-paginate-v2");
const { getSignedURL, deleteFile } = require("../utils/gCloudStorage");

const userSchema = new Schema(
	{
		name: { type: String, required: true },
		email: { type: String, unique: true, sparse: true },
		username: { type: String, unique: true, sparse: true },
		mobile: { type: String, unique: true, sparse: true },
		password: { type: String, default: null },
		profileImg: { type: String },
		googleId: { type: String, unique: true, sparse: true },
		telegramId: { type: String, unique: true, sparse: true },
		banned: { type: Boolean, default: false },
		deactivated: { type: Boolean, default: false },
		isProfileVerified: { type: Boolean, default: false },
		notifySMS: { type: Boolean, default: true },
		notifyEmail: { type: Boolean, default: true },
		enabled2FA: { type: Boolean, default: true },
		apiKeys: [{ type: Schema.Types.ObjectId, ref: "api_key" }],
		domains: [{ type: Schema.Types.ObjectId, ref: "domain" }],
		membershipTier: { type: Schema.Types.ObjectId, ref: "membership_tier" },
		badges: [userBadgeSchema],

		// Domain provider client information
		domainProviderClient: {
			openprovider: {
				clientId: { type: String },
				username: { type: String },
				createdAt: { type: Date },
				status: {
					type: String,
					enum: ["active", "inactive", "pending"],
					default: "pending",
				},
			},
			connectreseller: {
				clientId: { type: String },
				username: { type: String },
				createdAt: { type: Date },
				status: {
					type: String,
					enum: ["active", "inactive", "pending"],
					default: "pending",
				},
			},
		},

		cpanelAccounts: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "CpanelAccount" },
		],
		pleskAccounts: [
			{ type: mongoose.Schema.Types.ObjectId, ref: "PleskAccount" },
		],
	},
	{
		timestamps: true,
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.apiKeys;
				delete ret.password;
				delete ret.domains;
				delete ret.__v;
			},
		},
	}
);
userSchema.index({ email: "text" });
userSchema.plugin(mongoosePaginate);

const PasswordHistory = require('./PasswordHistory');
const PasswordValidator = require('../utils/passwordValidator');

userSchema.pre("save", async function (next) {
	if (this.isModified("password")) {
		// Validate password strength
		const passwordValidation = PasswordValidator.validatePassword(this.get("password"));
		if (!passwordValidation.isValid) {
			throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
		}

		// Check password history (prevent reuse of last 5 passwords)
		const historyCheck = await PasswordHistory.checkPasswordHistory(this._id, this.get("password"), 5);
		if (historyCheck.isReused) {
			throw new Error(`Password was recently used. Please choose a different password.`);
		}

		// Hash the password
		const hashedPassword = await hash(this.get("password"), 12); // Increased rounds for security
		this.set("password", hashedPassword);
	}

	next();
});

// Middleware to trigger tier and badge assignment after saving a new user
userSchema.post("save", async function (doc, next) {
	if (!doc.membershipTier) {
		await assignTierAndBadges(doc._id);
	}
	
	// Add password to history if password was changed
	if (this.isModified("password")) {
		await PasswordHistory.addPasswordToHistory(doc._id, doc.password, {
			changedBy: 'user',
			ipAddress: this.ipAddress || null,
			userAgent: this.userAgent || null
		});
	}
	
	next();
});

userSchema.method("isValidPassword", async function (password) {
	return await compare(password, this.get("password"));
});

userSchema.method("getProfileWithSignedURL", async function () {
	if (this.profileImg) {
		this.profileImg = await getSignedURL(this.profileImg);
	}
	return this;
});

userSchema.method("rewardPoints", async function () {
	const RewardPointLog = mongoose.model("reward_point_log");

	const result = await RewardPointLog.aggregate([
		{
			$match: {
				userId: this._id,
				$or: [
					{ expiryDate: { $eq: null } }, // false:Include if no expiry_date
					{ expiryDate: { $gt: new Date() } }, // Include if expiry_date is in the future
				],
			},
		},
		{
			$group: {
				_id: null,
				totalPoints: {
					$sum: {
						$cond: [
							{ $eq: ["$operationType", "credit"] },
							"$rewardPoints",
							{ $multiply: ["$rewardPoints", -1] },
						],
					},
				},
			},
		},
	]);
	return result.length > 0 ? result[0].totalPoints.toString() : 0;
});

userSchema.post("deleteOne", { document: true }, async function (doc) {
	try {
		const user = doc;
		if (user.profileImg) {
			await deleteFile(user.profileImg);
		}

		const APIKey = mongoose.model("api_key");
		const Domain = mongoose.model("domain");
		await Promise.all([
			APIKey.deleteMany({ user: user._id }),
			Domain.deleteMany({ user: user._id }),
		]);
	} catch (error) {
		console.error("Error removing reference from User collection:", error);
	}
});

const User = mongoose.model("user", userSchema);
module.exports = User;
