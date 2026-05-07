import mongoose from 'mongoose';

const User = mongoose.models.User || mongoose.model('User');

export const getExpenses = async (req, res) => {
  try {
    const user = await User.findById(req.params.  userId);
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

export const getExpenseSummary = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const expenses = user.expenses || [];

    // Monthly income vs expense
    const monthly = {};
    expenses.forEach(({ date, type, amount }) => {
      const month = date.slice(0, 7);
      if (!monthly[month]) monthly[month] = { month, income: 0, expense: 0 };
      monthly[month][type] += Number(amount);  // ✅ Convert here
    });

    // Spending by category
    const byCategory = {};
    expenses
    .filter(e => e.type === 'expense')
    .forEach(({ expenseType, amount }) => {
      byCategory[expenseType] = (byCategory[expenseType] || 0) + Number(amount); // ✅
    });

    res.json({
      monthly: Object.values(monthly).sort((a, b) =>
        a.month.localeCompare(b.month)
      ),
      byCategory: Object.entries(byCategory).map(([name, value]) => ({
        name,
        value
      }))
    });

  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ message: err.message });
  }
};