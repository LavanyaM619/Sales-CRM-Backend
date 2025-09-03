import express from "express";
import { registerUser, loginUser,getAllUsers,seedAdminUser} from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// For admin-only routes
router.get("/admin-only", protect, authorizeRoles("admin"), getAllUsers);


export default router;
