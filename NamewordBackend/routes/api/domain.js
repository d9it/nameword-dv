const router = require("express").Router();
const DomainController = require("../../app/controllers/connect-reseller/DomainController");
const {
	getDomainActivity,
} = require("../../app/controllers/activityController");
const {
	websiteNameRequiredRules,
	domainSearchRules,
	domainSuggestionRules,
	domainOrderRules,
	domainTransferRules,
	domainTLDOrderRules,
	domainRenewRules,
} = require("../../app/validations");
const validateRequest = require("../../app/middlewares/validate-request");
const validateAPIKey = require("../../app/middlewares/validate-apikey");
const { currentUser, requireAuth } = require("../../app/middlewares/auth");
const DomainContactController = require("../../app/controllers/domain/DomainContactController");

router.use(validateAPIKey, requireAuth);
router.get("/list", DomainController.domainList);
router.get(
	"/search",
	domainSearchRules,
	validateRequest,
	DomainController.domainSearch
);
router.get(
	"/suggestion",
	domainSuggestionRules,
	validateRequest,
	DomainController.domainSuggestion
);
router.get(
	"/tld-suggestion",
	websiteNameRequiredRules,
	validateRequest,
	DomainController.getTldSuggestion
);
router.get(
	"/price",
	websiteNameRequiredRules,
	validateRequest,
	DomainController.checkDomainPrice
);
router.get(
	"/order",
	domainOrderRules,
	validateRequest,
	DomainController.placeDomainOrder
);
router.get(
	"/tld-order",
	domainTLDOrderRules,
	validateRequest,
	DomainController.placeTldDomainOrder
);
router.get(
	"/transfer",
	domainTransferRules,
	validateRequest,
	DomainController.domainTransfer
);
router.get("/cancel-transfer", DomainController.domainCancelTransfer);
router.get("/validate-transfer", DomainController.domainValidateTransfer);
router.get(
	"/renew",
	domainRenewRules,
	validateRequest,
	DomainController.domainRenew
);
router.get("/modiify-nameserver", DomainController.modifyNameserver);
router.get("/modify-authcode", DomainController.modifyAuthcode);
router.get("/manage-lock", DomainController.manageDomainLock);
router.get("/manage-privacy", DomainController.manageDomainPrivacy);
router.get("/view-secret-key", DomainController.viewSecretKey);
router.get("/manage-dns-records", DomainController.manageDnsRecords);
router.get("/view-domain", DomainController.viewDomain);
router.get("/activity/:domain", getDomainActivity);
router.get("/:domainName/contacts", DomainContactController.getAll);
router.post("/:domainName/contacts", DomainContactController.add);
router.put("/:domainName/contacts/:contactId", DomainContactController.update);
router.delete(
	"/:domainName/contacts/:contactId",
	DomainContactController.remove
);

module.exports = router;
