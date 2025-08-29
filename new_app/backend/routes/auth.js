import express from "express";
const router = express.Router();

import { auth_controller } from "../controllers/index.js";

// Route for user registration
// POST /api/auth/register
router.post("/register", auth_controller.register);

// Route for user login
// POST /api/auth/login
router.post("/login", auth_controller.login);

export default router;
