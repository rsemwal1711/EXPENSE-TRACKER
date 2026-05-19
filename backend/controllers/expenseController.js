// import mongoose from 'mongoose';

// const User = mongoose.models.User || mongoose.model('User');

// // ── XP config ──────────────────────────────────────────────────────────────
// const XP = {
//   ADD_TRANSACTION: 15,
//   UPDATE_TRANSACTION: 5,
// };

// // Milestone bonuses based on total transaction count
// const MILESTONES = [
//   { count: 10,  bonus: 100 },
//   { count: 25,  bonus: 150 },
//   { count: 50,  bonus: 250 },
// ];

// // Returns milestone bonus if this transaction count hits one, else 0
// const getMilestoneBonus = (totalCount) => {
//   const hit = MILESTONES.find(m => m.count === totalCount);
//   return hit ? hit.bonus : 0;
// };
// // ──────────────────────────────────────────────────────────────────────────

// export const getExpenses = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user.expenses || []);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getExpenseById = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     const expense = user.expenses.find(e => e._id == req.params.id);
//     if (!expense) return res.status(404).json({ message: 'Not found' });
//     res.json(expense);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const addExpense = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const expense = { _id: Date.now().toString(), ...req.body };
//     user.expenses.push(expense);

//     // ── XP: base award ──
//     let xpEarned = XP.ADD_TRANSACTION;
//     let milestoneBonus = 0;
//     let milestoneMessage = null;

//     // ── XP: milestone bonus ──
//     const totalCount = user.expenses.length;
//     milestoneBonus = getMilestoneBonus(totalCount);
//     if (milestoneBonus > 0) {
//       xpEarned += milestoneBonus;
//       milestoneMessage = `🏆 ${totalCount} transactions milestone!`;
//     }

//     user.xp = (user.xp || 0) + xpEarned;
//     await user.save();

//     res.status(201).json({
//       expense,
//       xpEarned,
//       milestoneBonus,
//       milestoneMessage,
//       totalXp: user.xp,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const updateExpense = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const index = user.expenses.findIndex(e => e._id == req.params.id);
//     if (index === -1) return res.status(404).json({ message: 'Not found' });

//     user.expenses[index] = { ...user.expenses[index]._doc, ...req.body };

//     // ── XP: award for update ──
//     const xpEarned = XP.UPDATE_TRANSACTION;
//     user.xp = (user.xp || 0) + xpEarned;

//     await user.save();

//     res.json({
//       expense: user.expenses[index],
//       xpEarned,
//       totalXp: user.xp,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const deleteExpense = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     user.expenses = user.expenses.filter(e => e._id != req.params.id);
//     await user.save();
//     res.json({ message: 'Deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getExpenseSummary = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const expenses = user.expenses || [];

//     const monthly = {};
//     expenses.forEach(({ date, type, amount }) => {
//       const month = date.slice(0, 7);
//       if (!monthly[month]) monthly[month] = { month, income: 0, expense: 0 };
//       monthly[month][type] += Number(amount);
//     });

//     const byCategory = {};
//     expenses
//       .filter(e => e.type === 'expense')
//       .forEach(({ expenseType, amount }) => {
//         byCategory[expenseType] = (byCategory[expenseType] || 0) + Number(amount);
//       });

//     res.json({
//       monthly: Object.values(monthly).sort((a, b) =>
//         a.month.localeCompare(b.month)
//       ),
//       byCategory: Object.entries(byCategory).map(([name, value]) => ({
//         name,
//         value
//       }))
//     });

//   } catch (err) {
//     console.error('Summary error:', err);
//     res.status(500).json({ message: err.message });
//   }
// };.





import Expense from '../models/Expense.js';
import mongoose from 'mongoose';
import User from '../models/User.js';

// ── XP config ──────────────────────────────────────────────────────────────
const XP = {
  ADD_TRANSACTION: 15,
  UPDATE_TRANSACTION: 5,
};

const MILESTONES = [
  { count: 10,  bonus: 100 },
  { count: 25,  bonus: 150 },
  { count: 50,  bonus: 250 },
];

const getMilestoneBonus = (totalCount) => {
  const hit = MILESTONES.find(m => m.count === totalCount);
  return hit ? hit.bonus : 0;
};
// ──────────────────────────────────────────────────────────────────────────

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addExpense = async (req, res) => {
  console.log('🔥 NEW CONTROLLER RUNNING');  // ← add this
  try {
    console.log('1. req.user:', req.user);
    
    const expense = await Expense.create({ ...req.body, userId: req.user.id });
    console.log('2. expense created:', expense._id);

    const totalCount = await Expense.countDocuments({ userId: req.user.id });
    console.log('3. totalCount:', totalCount);

    let xpEarned = XP.ADD_TRANSACTION;
    let milestoneBonus = 0;
    let milestoneMessage = null;

    milestoneBonus = getMilestoneBonus(totalCount);
    if (milestoneBonus > 0) {
      xpEarned += milestoneBonus;
      milestoneMessage = `🏆 ${totalCount} transactions milestone! +${milestoneBonus} bonus XP!`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { xp: xpEarned } },
      { new: true }
    );
    console.log('4. user after XP update:', user?._id, 'xp:', user?.xp);  // ← if this prints null, User model is still broken

    res.status(201).json({
      expense,
      xpEarned,
      milestoneBonus,
      milestoneMessage,
      totalXp: user.xp,
    });
  } catch (err) {
    console.error('addExpense error:', err);  // ← will show exact error
    res.status(500).json({ message: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    // 1. Update the expense document
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Not found' });

    // 2. Award XP
    const xpEarned = XP.UPDATE_TRANSACTION;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { xp: xpEarned } },
      { new: true }
    );

    res.json({
      expense,
      xpEarned,
      totalXp: user.xp,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });

    const monthly = {};
    expenses.forEach(({ date, type, amount }) => {
      const month = date.slice(0, 7);
      if (!monthly[month]) monthly[month] = { month, income: 0, expense: 0 };
      monthly[month][type] += Number(amount);
    });

    const byCategory = {};
    expenses
      .filter(e => e.type === 'expense')
      .forEach(({ expenseType, amount }) => {
        byCategory[expenseType] = (byCategory[expenseType] || 0) + Number(amount);
      });

    res.json({
      monthly: Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)),
      byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};