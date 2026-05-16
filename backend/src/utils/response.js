/**
 * Unified API response helper - returns JSON objects (not calling res)
 */
function success(data = null, message = 'ok', statusCode = 200) {
  return { code: statusCode, message, data };
}

function error(data = null, message = 'Internal Server Error', statusCode = 500) {
  return { code: statusCode, message, data };
}

function unauthorized(message = 'Please login first') {
  return { code: 401, message, data: null };
}

function forbidden(message = 'No permission') {
  return { code: 403, message, data: null };
}

function badRequest(message = 'Bad Request') {
  return { code: 400, message, data: null };
}

module.exports = { success, error, unauthorized, forbidden, badRequest };
