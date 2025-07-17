const axios = require('axios');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { AuthDataValidator } = require('@telegram-auth/server');
const { objectToAuthDataMap } = require('@telegram-auth/server/utils');

class SocialAuthController{

    initAuth(req, res){
        const state = crypto.randomBytes(32).toString('hex');
        let scopes=['profile', 'email'];
        let url = `https://accounts.google.com/o/oauth2/v2/auth?scope=${scopes.join(' ')}&access_type=offline&prompt=consent&include_granted_scopes=true&response_type=code&redirect_uri=${process.env.GOOGLE_REDIRECT_URL}&client_id=${process.env.GOOGLE_CLIENT_ID}&state=${state}`;
        return res.redirect(url);
    }

    async googleCallback(req, res, next){
        const { code } = req.query;
        try {
            // Exchange authorization code for access token
            const  {data} = await axios({
                method:'post',
                url:'https://oauth2.googleapis.com/token',
                params:{
                    client_id:process.env.GOOGLE_CLIENT_ID,
                    client_secret:process.env.GOOGLE_CLIENT_SECRET, 
                    grant_type:'authorization_code',
                    code:code,
                    redirect_uri:process.env.GOOGLE_REDIRECT_URL
                    
                },
                headers: {'Content-type': 'application/x-www-form-urlencoded '}
            });

            const { access_token } = data;
       
            const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
              headers: { Authorization: `Bearer ${access_token}` },
            });
            let user = await User.findOne({googleId: profile.id});
            let userData = {}
            if(!user){
                userData = await User.create({
                    name: profile.name,
                    email: profile.email,
                    googleId: profile.id,
                    isProfileVerified: true
                });
            } else {
                userData = await user.getProfileWithSignedURL()
            }
            const userJwt = jwt.sign({
                id:user.id,
                email:user.email
            },process.env.JWT_KEY);
    
            req.session={jwt :userJwt};
         
			return res.status(200).json({ data: userData });
        } catch (error) {
            console.error('Error:', error.response.data.error);
			next(err);
        }
    }

	async telegramCallback(req, res, next){
		try{
			const validator = new AuthDataValidator({ botToken: process.env.TELEGRAM_BOT_TOKEN });
			const data = objectToAuthDataMap(req.body);
			const userData = await validator.validate(data);
			let user = await User.findOne({telegramId: userData.id});
            let userJson = {}
            if(!user){
                userJson = await User.create({
                    name: userData.first_name+" "+userData.last_name,
                    telegramId: userData.id,
                    isProfileVerified: true
                });
            } else {
                userJson = await user.getProfileWithSignedURL()
            }
			const userJwt = jwt.sign({
                id:user.id,
                email:user.email
            },process.env.JWT_KEY);
			req.session={jwt :userJwt};
			return res.status(200).json({ data: userJson });
		}catch(err){
			next(err);
		}
		
	}

}

module.exports = new SocialAuthController();