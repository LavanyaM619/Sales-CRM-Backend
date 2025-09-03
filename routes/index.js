import express from "express";
import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";

const router = express.Router();

// Mount auth routes
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);

export default router;
