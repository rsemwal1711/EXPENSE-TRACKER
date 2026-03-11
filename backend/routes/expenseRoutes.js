import express from "express";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense
} from "../controllers/expenseController.js";

const router = express.Router();

router.get("/expenses/:userId", getExpenses);
router.post("/expenses/:userId", addExpense);
router.put("/expenses/:userId/:expenseId", updateExpense);
router.delete("/expenses/:userId/:expenseId", deleteExpense);

export default router;