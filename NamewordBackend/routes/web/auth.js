const router = require("express").Router();

const SocialAuthController = require('../../app/controllers/auth/SocialAuthController');


router.get("/google", SocialAuthController.initAuth);
router.get("/google/callback", SocialAuthController.googleCallback);




module.exports = router;