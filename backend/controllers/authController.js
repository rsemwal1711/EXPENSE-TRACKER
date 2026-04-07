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