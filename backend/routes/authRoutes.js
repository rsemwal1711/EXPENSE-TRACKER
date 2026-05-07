import express from "express";
import { signup, login, updateUser, changePassword, deleteUser } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication routes (public)
router.post("/signup", signup);
router.post("/login", login);

// Protected routes (require JWT)
router.put("/update/:id", authenticateToken, updateUser);
router.put("/change-password/:id", authenticateToken, changePassword);
router.delete("/delete/:id", authenticateToken, deleteUser);

export default router;