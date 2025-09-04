import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  markOrderViewed,exportOrdersCsv,
} from "../controllers/orderController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/export", authorizeRoles("admin"), exportOrdersCsv);
router.post("/", createOrder);
router.get("/", authorizeRoles("admin"), getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.delete("/:id", authorizeRoles("admin"), deleteOrder);
router.patch("/:id/viewed", authorizeRoles("admin"), markOrderViewed);

export default router;
