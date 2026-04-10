import express from "express";
import {
  getExpenses,
  getExpense,
  addExpense,
  deleteExpense,
  updateExpense
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/expenses/:userId", getExpenses);
router.get("/expenses/:userId/:expenseId", getExpense);
router.post("/expenses/:userId", addExpense);
router.put("/expenses/:userId/:expenseId", updateExpense);
router.delete("/expenses/:userId/:expenseId", deleteExpense);

export default router;