const nodemailer = require("nodemailer");
const env = require("../../start/env");

const transporter = nodemailer.createTransport({
	host: env.MAIL_HOST,
	port: env.MAIL_PORT,
	secure: env.MAIL_PORT === 465, // Use `true` for port 465, `false` for all other ports
	auth: {
		user: env.MAIL_USERNAME,
		pass: env.MAIL_PASSWORD,
	},
	// Add timeout and connection settings
	connectionTimeout: 60000,
	greetingTimeout: 30000,
	// Always validate TLS certificates for security
	tls: {
		rejectUnauthorized: true // Always validate certificates - security requirement
	}
});

// Verify connection configuration
transporter.verify(function(error, success) {
	if (error) {
		console.error('Mailer configuration error:', error);
	} else {
		console.log('Mailer server is ready to send messages');
	}
});

module.exports = transporter;