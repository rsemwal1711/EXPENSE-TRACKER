import express from "express";
import { signup, login, updateUser, changePassword, deleteUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/users", signup);
router.post("/login", login);
router.put("/users/:id", updateUser);
router.put("/users/:id/password", changePassword);
router.delete("/users/:id", deleteUser);

export default router;