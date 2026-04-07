// import { getDB, saveDB } from "../utils/dbHelper.js";

// export const getExpenses = (req, res) => {
//   const db = getDB();
//   const user = db.users.find(u => u.id == req.params.userId);

//   if (!user)
//     return res.status(404).json({ message: "User not found" });

//   res.json(user.expenses);
// };

// export const addExpense = (req, res) => {
//   const db = getDB();
//   const user = db.users.find(u => u.id == req.params.userId);

//   if (!user)
//     return res.status(404).json({ message: "User not found" });

//   const newExpense = { id: Date.now(), ...req.body };

//   user.expenses.push(newExpense);
//   saveDB(db);

//   res.status(201).json(newExpense);
// };

// export const deleteExpense = (req, res) => {
//   const db = getDB();
//   const user = db.users.find(u => u.id == req.params.userId);

//   if (!user)
//     return res.status(404).json({ message: "User not found" });

//   user.expenses = user.expenses.filter(
//     e => e.id !== parseInt(req.params.expenseId)
//   );

//   saveDB(db);

//   res.json({ message: "Expense deleted" });
// };

// export const updateExpense = (req, res) => {
//   const db = getDB();
//   const user = db.users.find(u => u.id == req.params.userId);

//   if (!user)
//     return res.status(404).json({ message: "User not found" });

//   const expenseIndex = user.expenses.findIndex(
//     e => e.id === parseInt(req.params.expenseId)
//   );

//   if (expenseIndex === -1)
//     return res.status(404).json({ message: "Expense not found" });

//   user.expenses[expenseIndex] = { ...user.expenses[expenseIndex], ...req.body };
//   saveDB(db);

//   res.json(user.expenses[expenseIndex]);
// };




import mongoose from "mongoose";

// schema + model (same file)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  expenses: {
    type: Array,
    default: []
  }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);


// GET EXPENSES
export const getExpenses = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user.expenses);

  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// ADD EXPENSE
export const addExpense = async (req, res) => {
  try {
    const newExpense = { _id: Date.now().toString(), ...req.body };

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { expenses: newExpense } },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.status(201).json(newExpense);

  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// DELETE EXPENSE
export const deleteExpense = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $pull: {
          expenses: { _id: req.params.expenseId }
        }
      },
      { new: true }
    );

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Expense deleted" });

  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


// UPDATE EXPENSE
export const updateExpense = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const expenseIndex = user.expenses.findIndex(
      e => e._id === req.params.expenseId
    );

    if (expenseIndex === -1)
      return res.status(404).json({ message: "Expense not found" });

    user.expenses[expenseIndex] = {
      ...user.expenses[expenseIndex],
      ...req.body
    };

    await user.save();

    res.json(user.expenses[expenseIndex]);

  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};