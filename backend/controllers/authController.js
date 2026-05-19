import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/authMiddleware.js";
import User from '../models/User.js';

// const userSchema = new mongoose.Schema({
//   name: String,
//   email: { type: String, unique: true },
//   password: String,
//   googleId: String,
//   provider: { type: String, default: 'local' },
//   profilePicture: String,
//   xp: { type: Number, default: 0 },
//   expenses: {
//     type: Array,
//     default: []
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// const User = mongoose.models.User || mongoose.model("User", userSchema);

// SIGNUP
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password required" });
  }

  try {
    console.log('Signup attempt for:', email);
    const existingUser = await User.findOne({ email }).maxTimeMS(10000);

    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      xp: 10,
      expenses: []
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      message: "Signup successful",
      user: {
        _id: newUser._id,  // ✅ fixed
        id: newUser._id,   // ✅ kept for compatibility
        name: newUser.name,
        email: newUser.email,
        xp: newUser.xp
      },
      xpEarned: 10,
      token
    });

  } catch (err) {
    console.error('Signup error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      res.status(503).json({ message: "Database connection failed" });
    } else {
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    console.log('Login attempt for:', email);
    const user = await User.findOne({ email }).maxTimeMS(10000);

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid email or password" });

    // Add 10 XP on login
    user.xp = (user.xp || 0) + 10;
    await user.save();

    const token = generateToken(user);

    req.session.user = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,  // ✅ fixed
        id: user._id,   // ✅ kept for compatibility
        name: user.name,
        email: user.email,
        xp: user.xp
      },
      xpEarned: 10,
      token
    });

  } catch (err) {
    console.error('Login error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      res.status(503).json({ message: "Database connection failed" });
    } else {
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
};

// UPDATE USER PROFILE
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email required" });
  }

  try {
    console.log('Update attempt for user:', id);

    const existingUser = await User.findOne({ email, _id: { $ne: id } }).maxTimeMS(10000);
    if (existingUser) {
      return res.status(400).json({ message: "Email already taken by another user" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    ).maxTimeMS(10000);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,  // ✅ fixed
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email
      }
    });

  } catch (err) {
    console.error('Update error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      res.status(503).json({ message: "Database connection failed" });
    } else {
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  try {
    console.log('Password change attempt for user:', id);

    const user = await User.findById(id).maxTimeMS(10000);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(id, { password: hashedPassword }).maxTimeMS(10000);

    res.json({ message: "Password changed successfully" });

  } catch (err) {
    console.error('Password change error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      res.status(503).json({ message: "Database connection failed" });
    } else {
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
};

// DELETE USER ACCOUNT
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('Delete attempt for user:', id);

    const deletedUser = await User.findByIdAndDelete(id).maxTimeMS(10000);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });

  } catch (err) {
    console.error('Delete error:', err.message);
    if (err.name === 'MongoServerSelectionError') {
      res.status(503).json({ message: "Database connection failed" });
    } else {
      res.status(500).json({ message: err.message || "Server error" });
    }
  }
};