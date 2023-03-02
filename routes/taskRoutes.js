import express from "express";
const router = express.Router();

import {
  createTask,
  deleteTask,
  getAllTasks,
  updateTask,
} from "../controllers/tasksController.js";
import authenticateUser from "../middleware/authentication.js";

router
  .route("/")
  .post(authenticateUser, createTask)
  .get(authenticateUser, getAllTasks);
router
  .route("/:id")
  .delete(authenticateUser, deleteTask)
  .patch(authenticateUser, updateTask);

export default router;
