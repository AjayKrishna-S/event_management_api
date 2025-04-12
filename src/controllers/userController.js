const User = require('../models/user');
const jwt = require('jsonwebtoken');
const responseFormatter = require('../utils/responseFormatter');

const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res.status(400).json(responseFormatter({}, 400, 'Please fill in all fields'));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(responseFormatter({}, 400, 'User already exists'));
    }

    const user = await User.create({ name, email, password, role });

    if (user) {
      res.status(201).json(responseFormatter({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id, user.role)
      }, 201, 'User registered successfully'));
    } else {
      res.status(400).json(responseFormatter({}, 400, 'Invalid user data'));
    }
  } catch (error) {
    res.status(500).json(responseFormatter({}, 500, error.message));
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: { $ne: true } }).select('+password');
    if (!user) {
      return res.status(401).json(responseFormatter({}, 401, 'Invalid email or password'));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json(responseFormatter({}, 401, 'Invalid email or password'));
    }

    res.json(responseFormatter({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id, user.role)
    }, 200, 'Login successful'));
  } catch (error) {
    res.status(500).json(responseFormatter({}, 500, error.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (user) {
      res.json(responseFormatter({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }, 200, 'User profile fetched successfully'));
    } else {
      res.status(404).json(responseFormatter({}, 404, 'User not found'));
    }
  } catch (error) {
    res.status(500).json(responseFormatter({}, 500, error.message));
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json(responseFormatter({}, 403, 'Not authorized to view all users'));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filterOptions = { isDeleted: { $ne: true } };

    if (req.query.search) {
      filterOptions.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(filterOptions)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filterOptions);

    res.json(responseFormatter({
      users,
      page,
      pages: Math.ceil(total / limit),
      total
    }, 200, 'Users fetched successfully'));
  } catch (error) {
    res.status(500).json(responseFormatter({}, 500, error.message));
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json(responseFormatter({}, 404, 'User not found'));
    }

    if (req.role !== 'admin' && req.userId !== user._id.toString()) {
      return res.status(403).json(responseFormatter({}, 403, 'Not authorized to delete this user'));
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    res.json(responseFormatter({}, 200, 'User successfully marked as deleted'));
  } catch (error) {
    res.status(500).json(responseFormatter({}, 500, error.message));
  }
};

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  deleteUser,
  getAllUsers
};
