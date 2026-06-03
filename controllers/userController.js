const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/standardResponse');

// GET /users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      message: 'Users fetched successfully',
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data: users,
    });
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// GET /users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json(errorResponse('User not found'));
    res.json(successResponse('User fetched successfully', user));
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};
