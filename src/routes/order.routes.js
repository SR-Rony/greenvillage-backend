import { Router } from "express";
import { create, myOrders, all, updateStatus } from "../controllers/order.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

// User routes
router.post("/", create);        // Create order
router.get("/:id", myOrders);    // Get current user's orders

// Admin routes
router.get("/", all);           // Get all orders
router.patch("/:id/status", requireAuth, requireAdmin, updateStatus); // Update order status

export default router;
