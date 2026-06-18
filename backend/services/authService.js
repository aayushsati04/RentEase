const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

class AuthService {
  async registerUser(userData) {
    const { name, email, password, phone, role } = userData;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new ApiError(400, 'User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };
  }

  async loginUser(email, password) {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    };
  }

  async getUserProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };
  }

  async syncSupabaseUser(userData) {
    const { email, name, phone, role } = userData;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user in MongoDB since they signed up via Supabase (or OAuth)
      // Generate a random password since Supabase handles authentication
      const randomPassword = require('crypto').randomBytes(16).toString('hex');
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        phone: phone || '0000000000',
        role: role || 'tenant'
      });
    } else {
      // Optionally update details if they changed
      let updated = false;
      if (name && user.name !== name) {
        user.name = name;
        updated = true;
      }
      if (phone && user.phone !== phone) {
        user.phone = phone;
        updated = true;
      }
      if (role && user.role !== role) {
        user.role = role;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id)
    };
  }

  async getAllUsersExceptSelf(currentUserId) {
    return await User.find({ _id: { $ne: currentUserId } }).select('-password');
  }
}

module.exports = new AuthService();
