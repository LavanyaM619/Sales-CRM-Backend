import express from "express";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from "../controllers/categoryController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/", protect, authorizeRoles("admin"), createCategory);
router.put("/:id", protect, authorizeRoles("admin"), updateCategory);
router.delete("/:id", protect, authorizeRoles("admin"), deleteCategory);

export default router;
