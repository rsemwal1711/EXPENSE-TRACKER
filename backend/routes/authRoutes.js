import express from "express";
import { signup, login, updateUser, changePassword, deleteUser } from "../controllers/authController.js";

const router = express.Router();

// Authentication routes
router.post("/signup", signup);
router.post("/login", login);
router.put("/update/:id", updateUser);
router.put("/change-password/:id", changePassword);
router.delete("/delete/:id", deleteUser);

export default router;