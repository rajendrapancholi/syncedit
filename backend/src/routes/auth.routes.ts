import { Router } from "express";
import { login, logout, me, register } from "../controllers/auth.controller";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.get("/me", authMiddleware, me);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;
