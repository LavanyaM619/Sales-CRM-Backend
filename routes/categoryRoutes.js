import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: get all categories
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin-only routes
router.post("/", protect, authorizeRoles("admin"), createCategory);
router.put("/:id", protect, authorizeRoles("Admin"), updateCategory);
router.delete("/:id", protect, authorizeRoles("Admin"), deleteCategory);

export default router;
