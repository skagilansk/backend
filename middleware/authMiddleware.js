const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/standardResponse');

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(errorResponse('Access denied. No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json(errorResponse('Invalid token. User not found'));
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid or expired token'));
  }
};

/**
 * Middleware to check if user has required role(s)
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(errorResponse('Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(errorResponse('Insufficient permissions'));
    }
    next();
  };
};

module.exports = { authenticate, authorize };
