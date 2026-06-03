const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/standardResponse');

// POST /auth/register
exports.register = async (req, res) => {
  try {
    const { userId, name, email, password, role } = req.body;

    if (!userId || !name || !email || !password) {
      return res.status(400).json(errorResponse('userId, name, email and password are required'));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { userId }] });
    if (existingUser) {
      return res.status(400).json(errorResponse('User with this email or userId already exists'));
    }

    const newUser = new User({
      userId,
      name,
      email,
      password,
      role: role || 'developer',
    });

    const savedUser = await newUser.save();
    res.status(201).json(successResponse('User registered successfully', savedUser));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// POST /auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse('Email and password are required'));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json(errorResponse('Invalid credentials'));
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /auth/me
exports.getMe = async (req, res) => {
  try {
    res.json(successResponse('Authenticated user fetched successfully', req.user.toJSON()));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};
