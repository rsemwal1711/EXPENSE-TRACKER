import mongoose from 'mongoose';

const User = mongoose.models.User || mongoose.model('User');

export const getExpenses = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.expenses || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const expense = user.expenses.find(e => e._id == req.params.id);
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const expense = { _id: Date.now().toString(), ...req.body };
    user.expenses.push(expense);
    await user.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const index = user.expenses.findIndex(e => e._id == req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Not found' });
    user.expenses[index] = { ...user.expenses[index], ...req.body };
    await user.save();
    res.json(user.expenses[index]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.expenses = user.expenses.filter(e => e._id != req.params.id);
    await user.save();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};