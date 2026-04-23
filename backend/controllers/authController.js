// import { getDB, saveDB } from "../utils/dbHelper.js";

// export const signup = (req, res) => {
//   const db = getDB();
//   const { name, email, password } = req.body;

//   const existingUser = db.users.find(u => u.email === email);

//   if (existingUser)
//     return res.status(400).json({ message: "User already exists" });

//   const newUser = {
//     id: Date.now(),
//     name,
//     email,
//     password,
//     expenses: []
//   };

//   db.users.push(newUser);
//   saveDB(db);
//   res.status(201).json({ message: "Signup successful", user: newUser });
// };


// export const login = (req, res) => {
//   const db = getDB();
//   const { email, password } = req.body;

//   const user = db.users.find(
//     u => u.email === email && u.password === password
//   );

//   if (!user)
//     return res.status(401).json({ message: "Invalid email or password" });

//   res.json({ message: "Login successful", user });
// };



import mongoose from "mongoose";

// define schema + model here (no models folder needed)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  expenses: {
    type: Array,
    default: []
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);


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

    const newUser = new User({
      name,
      email,
      password,
      expenses: []
    });

    await newUser.save();

    res.status(201).json({ message: "Signup successful", user: newUser });

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
    const user = await User.findOne({ email, password }).maxTimeMS(10000);

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({ message: "Login successful", user });

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

    // Check if email is already taken by another user
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

    res.json({ message: "Profile updated successfully", user: updatedUser });

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

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    await User.findByIdAndUpdate(id, { password: newPassword }).maxTimeMS(10000);

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