const ErrorHandler = require('../utils/errorHandler');

module.exports = function (handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      // Use comprehensive error handling
      ErrorHandler.logError(error, {
        type: 'async_middleware_error',
        url: req.url,
        method: req.method,
        userId: req.user?.id,
        ip: req.ip
      });
      next(error)
    }
  }
}
