import express from "express";
const router = express.Router();

import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
import authenticateUser from "../middleware/authentication.js";

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/getCurrentUser").get(authenticateUser, getCurrentUser);
router.route("/logout").get(logout);

export default router;
