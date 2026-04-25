// import express from "express";
// import {
//   getExpenses,
//   getExpense,
//   addExpense,
//   deleteExpense,
//   updateExpense
// } from "../controllers/expenseController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // All expense routes are protected with JWT authentication
// router.get("/expenses/:userId", authenticateToken, getExpenses);
// router.get("/expenses/:userId/:expenseId", authenticateToken, getExpense);
// router.post("/expenses/:userId", authenticateToken, addExpense);
// router.put("/expenses/:userId/:expenseId", authenticateToken, updateExpense);
// router.delete("/expenses/:userId/:expenseId", authenticateToken, deleteExpense);

// export default router;

import express from 'express';
import { 
  getExpenses, 
  getExpenseById, 
  addExpense, 
  updateExpense, 
  deleteExpense 
} from '../controllers/expenseController.js';

const router = express.Router();

router.get('/expenses/:userId', getExpenses);
router.post('/expenses/:userId', addExpense);
router.get('/expenses/:userId/:id', getExpenseById);
router.put('/expenses/:userId/:id', updateExpense);
router.delete('/expenses/:userId/:id', deleteExpense);

export default router;