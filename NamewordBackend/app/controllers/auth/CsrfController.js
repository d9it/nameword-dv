const { generateCsrfToken } = require('../../middlewares/csrf');

class CsrfController {
	/**
	 * Get CSRF token for frontend applications
	 * This endpoint allows frontend to get a fresh CSRF token
	 */
	static async getCsrfToken(req, res) {
		try {
			// Generate a new CSRF token
			const token = generateCsrfToken(req, res, () => {});
			
			res.status(200).json({
				success: true,
				message: 'CSRF token generated successfully',
				data: {
					token: res.getHeader('X-CSRF-Token'),
					expiresIn: '24 hours'
				}
			});
		} catch (error) {
			console.error('Error generating CSRF token:', error);
			res.status(500).json({
				success: false,
				message: 'Failed to generate CSRF token',
				error: error.message
			});
		}
	}

	/**
	 * Validate CSRF token (for testing purposes)
	 */
	static async validateCsrfToken(req, res) {
		try {
			const { token } = req.body;
			
			if (!token) {
				return res.status(400).json({
					success: false,
					message: 'CSRF token is required'
				});
			}

			// The validation is handled by the middleware
			// This endpoint just confirms the token is valid
			res.status(200).json({
				success: true,
				message: 'CSRF token is valid'
			});
		} catch (error) {
			res.status(403).json({
				success: false,
				message: 'Invalid CSRF token',
				error: 'CSRF_ERROR'
			});
		}
	}
}

module.exports = CsrfController; 