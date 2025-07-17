const Transaction = require("../../models/Transaction");
const User = require("../../models/User");
const Wallet = require("../../models/Wallet");
const Invoice = require("../../models/Invoice");
const Counter = require("../../models/Counter");
const axios = require("axios");
const moment = require("moment");

const baseUrl = process.env.DYNO_PAY_BASE_URL;
const apiKey = process.env.DYNO_PAY_API_KEY;
const walletToken = process.env.DYNO_PAY_WALLET_TOKEN;

// Create a wallet for a user
const createWallet = async (req, res) => {
	try {
		const userId = req.user.id;

		let existingWallet = await Wallet.findOne({ userId });
		if (existingWallet) {
			return res
				.status(400)
				.json({ success: false, message: "Wallet already exists" });
		}

		const wallet = new Wallet({ userId });
		await wallet.save();

		res.status(201).json({
			success: true,
			message: "Wallet created successfully",
			data: wallet,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error creating wallet",
			error: error.message,
		});
	}
};

// Get wallet details
const getWallet = async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}
		let wallet = await Wallet.findOne({ userId });

		if (!wallet) {
			wallet = new Wallet({ userId });
			await wallet.save();
			console.log(`Auto-created wallet for user ${userId}`);
			wallet = await Wallet.findOne({ userId });
		}

		const totalRewardPoints = await user.rewardPoints();

		// Convert Map to plain object for JSON response
		const walletData = wallet.toObject();
		const balanceObject = {};
		if (wallet.balance instanceof Map) {
			wallet.balance.forEach((value, key) => {
				balanceObject[key] = value;
			});
		}
		walletData.balance = balanceObject;

		res.json({
			success: true,
			data: { ...walletData, totalRewardPoints },
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error fetching wallet",
			error: error.message,
		});
	}
};

// Fund Wallet
const fundWallet = async (req, res) => {
	try {
		const { amount, currency, method, reference } = req.body;

		const userId = req.user.id;
		const user = await User.findById(userId);
		let wallet = await Wallet.findOne({ userId });
		if (!wallet) {
			wallet = new Wallet({ userId });
			await wallet.save();
			wallet = await Wallet.findOne({ userId });
			console.log(`Auto-created wallet for user ${userId}`);
		}

		if (!wallet.balance.has(currency)) {
			return res
				.status(400)
				.json({ success: false, message: "Unsupported currency" });
		}

		wallet.balance.set(
			currency,
			Number(wallet.balance.get(currency)) + Number(amount)
		);
		wallet.lastTransactionAt = new Date();

		// Create transaction record
		const transaction = new Transaction({
			userId,
			walletId: wallet._id,
			amount,
			currency,
			type: "credit",
			method,
			reference,
			status: "completed",
			from: "nameword",
		});

		await wallet.save();
		await transaction.save();

		// Generate Invoice
		const invoiceNumber = await Counter.getNextInvoiceNumber();
		const vatPercentage = 20;
		const totalAmount = amount;
		const subtotal = totalAmount / (1 + vatPercentage / 100);
		const vatAmount = totalAmount - subtotal;

		const invoice = new Invoice({
			invoiceNumber: `#${invoiceNumber}`,
			userId,
			transactionId: transaction._id,
			to: {
				name: user.name,
				email: user.email,
			},
			items: [
				{
					description: "Wallet Funding",
					quantity: 1,
					price: subtotal,
					total: subtotal,
				},
			],
			subtotal: subtotal,
			vat: {
				percentage: vatPercentage,
				amount: vatAmount,
			},
			total: totalAmount,
			status: "paid",
			paidAt: new Date(),
		});

		await invoice.save();

		// Update transaction with invoiceId
		transaction.invoiceId = invoice._id;
		await transaction.save();

		// Convert Map to plain object for JSON response
		const balanceObject = {};
		wallet.balance.forEach((value, key) => {
			balanceObject[key] = value;
		});

		res.json({
			success: true,
			message: "Wallet funded successfully",
			data: { balance: balanceObject, invoiceId: invoice._id },
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error funding wallet",
			error: error.message,
		});
	}
};

// Process Payment
const processPayment = async (req, res) => {
	try {
		const userId = req.user.id;
		const { amount, currency, method, reference } = req.body;

		let wallet = await Wallet.findOne({ userId });
		if (!wallet) {
			wallet = new Wallet({ userId });
			await wallet.save();
			console.log(`Auto-created wallet for user ${userId}`);
			wallet = await Wallet.findOne({ userId });
		}

		if (!wallet.balance.has(currency)) {
			return res
				.status(400)
				.json({ success: false, message: "Unsupported currency" });
		}

		if (wallet.balance.get(currency) < amount) {
			return res
				.status(400)
				.json({ success: false, message: "Insufficient balance" });
		}

		wallet.balance.set(currency, wallet.balance.get(currency) - amount);
		wallet.lastTransactionAt = new Date();

		// Create transaction record
		const transaction = new Transaction({
			userId,
			walletId: wallet._id,
			amount,
			currency,
			type: "debit",
			method,
			reference,
			status: "completed",
			from: "nameword",
		});

		await wallet.save();
		await transaction.save();

		// Convert Map to plain object for JSON response
		const balanceObject = {};
		wallet.balance.forEach((value, key) => {
			balanceObject[key] = value;
		});

		res.json({
			success: true,
			message: "Payment processed successfully",
			data: { balance: balanceObject },
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: "Error processing payment",
			error: error.message,
		});
	}
};

// To get dyno checkour URL
const getDynocheckoutUrl = async (req, res) => {
	try {
		const { amount } = req.body;
		const userId = req.user.id;

		const reference = `dynocheckout_${moment().format("YYYYMMDDHHmmss")}`;

		// Fetch user's wallet
		let wallet = await Wallet.findOne({ userId });
		if (!wallet) {
			// Create a new wallet if not found
			wallet = new Wallet({ userId, balance: new Map() });
		}

		// Save Transaction as Pending
		const transaction = new Transaction({
			userId,
			walletId: wallet._id,
			amount,
			currency: "USD",
			type: "credit",
			method: "dynocheckout",
			reference: reference,
			status: "pending",
			from: "nameword",
			createdAt: new Date(),
		});

		await transaction.save();

		const paymentRequest = {
			amount,
			redirect_uri: `${process.env.APP_URL}/api/v1/wallet/dynocheckout-webhook`,
			meta_data: {
				amount,
				userId,
				reference,
				product_name: "nameword",
			},
		};

		// Call DynoCheckout API
		const response = await axios.post(
			`${baseUrl}/user/createPayment`,
			paymentRequest,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${walletToken}`,
					"x-api-key": apiKey,
				},
			}
		);

		// Send response back to frontend
		return res.status(200).json({
			success: true,
			message: response?.data?.data?.message,
			redirect_url: response.data?.data?.redirect_url || null,
		});
	} catch (error) {
		console.error(
			"Error in getDynocheckoutUrl:",
			error?.response?.data || error?.message
		);
		return res.status(500).json({
			success: false,
			message: "Failed to get dynocheckout url.",
			error: error?.response?.data || error?.message,
		});
	}
};

const handleDynoPaymentWebhook = async (req, res) => {
	try {
		let { transaction_id, status, meta_data, payment_type } = req.query;

		if (typeof meta_data === "string") {
			meta_data = JSON.parse(meta_data);
		}

		const { reference, userId, amount } = meta_data;
		const currency = "USD";

		if (!reference || !userId) {
			console.warn("Invalid request data.");
			return res
				.status(400)
				.json({ success: false, message: "Invalid request data." });
		}

		// Check if the transaction already exists to prevent duplicates
		const existingTransaction = await Transaction.findOne({
			reference,
			userId,
		});
		if (existingTransaction?.status !== "pending") {
			console.warn(
				`⚠ Transaction with reference ${reference} already processed.`
			);
			return res.status(200).json({
				success: true,
				message: "Transaction already recorded.",
			});
		}

		if (status !== "successful") {
			console.warn(`⚠ Payment failed for reference ${reference}`);
			return res
				.status(400)
				.json({ success: false, message: "Payment failed." });
		}

		// Fetch user's wallet
		let wallet = await Wallet.findOne({ userId });
		if (!wallet) {
			// Create a new wallet if not found
			wallet = new Wallet({ userId, balance: new Map() });
		}
		// Add funds to wallet
		const currentBalance = wallet.balance.get(currency) || 0;
		wallet.balance.set(currency, currentBalance + amount);
		await wallet.save();

		// Update transaction status
		await Transaction.updateOne(
			{ reference },
			{
				$set: {
					status: "completed",
					method: payment_type,
					reference: transaction_id,
					updatedAt: new Date(),
					from: "dynocash",
				},
			}
		);

		console.log(
			`✅ Payment processed successfully for user ${userId}, Amount: ${amount} ${currency}`
		);

		return res.status(200).json({
			success: true,
			message: "Wallet updated successfully.",
			new_balance: wallet.balance.get(currency),
		});
	} catch (error) {
		console.error("❌ Error in handleDynoPaymentWebhook:", error.message);
		return res
			.status(500)
			.json({ success: false, message: "Internal server error." });
	}
};

module.exports = {
	createWallet,
	getWallet,
	fundWallet,
	processPayment,
	getDynocheckoutUrl,
	handleDynoPaymentWebhook,
};
