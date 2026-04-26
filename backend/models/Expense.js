import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense'
  },
  expenseType: {
    type: String,
    enum: ['grocery', 'electronics', 'food', 'transport', 'entertainment', 'utilities', 'healthcare', 'education', 'shopping', 'other'],
    default: 'other'
  },
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);