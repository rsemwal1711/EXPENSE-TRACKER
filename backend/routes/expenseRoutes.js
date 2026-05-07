import express from 'express';
import {
  getExpenses,
  getExpenseById,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary
} from '../controllers/expenseController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Summary route — must be BEFORE /:userId to avoid conflict
router.get('/expenses/summary', authenticateToken, getExpenseSummary);

// All expense routes are protected with JWT authentication
router.get('/expenses/:userId', authenticateToken, getExpenses);
router.post('/expenses/:userId', authenticateToken, addExpense);
router.get('/expenses/:userId/:id', authenticateToken, getExpenseById);
router.put('/expenses/:userId/:id', authenticateToken, updateExpense);
router.delete('/expenses/:userId/:id', authenticateToken, deleteExpense);

export default router;