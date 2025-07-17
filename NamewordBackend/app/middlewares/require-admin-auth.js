const NotAuthorizedError = require("../errors/NotAuthorizedError");

const requireAdminAuth = (req, res, next)=>{
    if(!req.admin){
        throw new NotAuthorizedError();
    }
    next();
}

module.exports = requireAdminAuth;