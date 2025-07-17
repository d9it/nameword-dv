const { apiSecurityHeaders, adminSecurityHeaders } = require('../app/middlewares/security-headers');
const { apiSanitization, adminSanitization } = require('../app/middlewares/comprehensive-input-sanitization');

module.exports = (app)=>{

    //api
    app.use('/api/v1', apiSecurityHeaders, apiSanitization(), require('./api'));
    
    // Admin routes with stricter security
    app.use('/api/v1/admin', adminSecurityHeaders, adminSanitization(), require('./api/admin'));
    
    //web
    app.use('/',require('./web'));
}