import { getDB, saveDB } from "../utils/dbHelper.js";

export const getExpenses = (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id == req.params.userId);

  if (!user)
    return res.status(404).json({ message: "User not found" });

  res.json(user.expenses);
};

export const addExpense = (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id == req.params.userId);

  if (!user)
    return res.status(404).json({ message: "User not found" });

  const newExpense = { id: Date.now(), ...req.body };

  user.expenses.push(newExpense);
  saveDB(db);

  res.status(201).json(newExpense);
};

export const deleteExpense = (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id == req.params.userId);

  if (!user)
    return res.status(404).json({ message: "User not found" });

  user.expenses = user.expenses.filter(
    e => e.id !== parseInt(req.params.expenseId)
  );

  saveDB(db);

  res.json({ message: "Expense deleted" });
};

export const updateExpense = (req, res) => {
  const db = getDB();
  const user = db.users.find(u => u.id == req.params.userId);

  if (!user)
    return res.status(404).json({ message: "User not found" });

  const expenseIndex = user.expenses.findIndex(
    e => e.id === parseInt(req.params.expenseId)
  );

  if (expenseIndex === -1)
    return res.status(404).json({ message: "Expense not found" });

  user.expenses[expenseIndex] = { ...user.expenses[expenseIndex], ...req.body };
  saveDB(db);

  res.json(user.expenses[expenseIndex]);
};