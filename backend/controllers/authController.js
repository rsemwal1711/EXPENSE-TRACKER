import { getDB, saveDB } from "../utils/dbHelper.js";

export const signup = (req, res) => {
  const db = getDB();
  const { name, email, password } = req.body;

  const existingUser = db.users.find(u => u.email === email);

  if (existingUser)
    return res.status(400).json({ message: "User already exists" });

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    expenses: []
  };

  db.users.push(newUser);
  saveDB(db);

  res.status(201).json({ message: "Signup successful", user: newUser });
};


export const login = (req, res) => {
  const db = getDB();
  const { email, password } = req.body;

  const user = db.users.find(
    u => u.email === email && u.password === password
  );

  if (!user)
    return res.status(401).json({ message: "Invalid email or password" });

  res.json({ message: "Login successful", user });
};