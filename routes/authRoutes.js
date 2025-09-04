import express from "express";
import { registerUser, loginUser, getAllUsers, seedAdminUser } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/seed-admin", seedAdminUser); // optional manual seed endpoint
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

export default router;
