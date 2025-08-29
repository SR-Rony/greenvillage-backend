import { Router } from "express";
import { create, myOrders, all, updateStatus } from "../controllers/order.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.post("/", requireAuth, create);
router.get("/me", requireAuth, myOrders);
router.get("/", requireAuth, requireAdmin, all);
router.patch("/:id/status", requireAuth, requireAdmin, updateStatus);

export default router;