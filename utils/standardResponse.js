/**
 * Standard Success Response Format
 */
const successResponse = (message, data = []) => {
  return {
    success: true,
    message: message,
    data: data
  };
};

/**
 * Standard Error Response Format
 */
const errorResponse = (message) => {
  return {
    success: false,
    message: message
  };
};

module.exports = {
  successResponse,
  errorResponse
};
