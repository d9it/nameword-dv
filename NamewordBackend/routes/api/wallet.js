const express = require("express");
const {
	createWallet,
	getWallet,
	fundWallet,
	processPayment,
	getDynocheckoutUrl,
	handleDynoPaymentWebhook,
} = require("../../app/controllers/wallet/WalletController");
const { getUserDataMiddleware } = require("../../app/middlewares/user");
const validateRequest = require("../../app/middlewares/validate-request");
const {
	createWalletRules,
	getWalletRules,
	fundWalletRules,
	processPaymentRules,
	dynoCheckoutURLRules,
} = require("../../app/validations/walletRules");
const validateAPIKey = require("../../app/middlewares/validate-apikey");
const { requireAuth } = require("../../app/middlewares/auth");
const { financialLimiter } = require("../../app/middlewares/rate-limiter");
const router = express.Router();

router.get("/dynocheckout-webhook", handleDynoPaymentWebhook);
router.use(validateAPIKey, requireAuth);
router.post("/create", sensitiveLimiter, createWalletRules, validateRequest, createWallet);
router.get("/get", getWalletRules, validateRequest, getWallet);

router.post("/fund", sensitiveLimiter, fundWalletRules, validateRequest, fundWallet);
router.post("/pay", sensitiveLimiter, processPaymentRules, validateRequest, processPayment);
router.post(
	"/dynocheckout-url",
	dynoCheckoutURLRules,
	validateRequest,
	getDynocheckoutUrl
);

module.exports = router;
