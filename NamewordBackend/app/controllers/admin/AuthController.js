const Admin = require("../../models/Admin");
const BadRequestError = require('../../errors/BadRequestError');
const jwt = require('jsonwebtoken');

class AuthController{

	async login(req, res, next){
		const { email, password} = req.body;
        const user = await Admin.findOne({email});
        if(!user){
            throw new BadRequestError("Email is not registered with us.");
        }
        const isValid = await user.isValidPassword(password);
        if(!isValid){
            throw new BadRequestError("Invalid credentials")
        }
        const SessionSecurity = require('../../middlewares/session-security');
        
        try {
            // Rotate session for security
            await SessionSecurity.rotateSession(req, res, user, true);
        } catch (error) {
            console.error('Session rotation failed during admin login:', error);
            // Continue with login even if session rotation fails
        }
        
        return res.status(200).json({data:user});
	}

	async register(req, res, next){
		let admin = new Admin({
			name:req.body.name,
			email:req.body.email,
			password:req.body.password
		})
		await admin.save();
		return res.status(201).json({data:admin});
	}

	async logout(req, res, next){
        const SessionSecurity = require('../../middlewares/session-security');
        return SessionSecurity.logout(req, res, next);
    }
}

module.exports = new AuthController();