import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);