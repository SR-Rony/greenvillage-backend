import { Router } from "express";
import { list, getOne, create, update, remove } from "../controllers/product.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

// Public routes
router.get("/", list);              // List all active products
router.get("/:slug", getOne);       // Get a single product by slug

// Protected admin routes
router.post("/", requireAuth, requireAdmin, create);   // Create a new product
router.patch("/:id", requireAuth, requireAdmin, update); // Update a product
router.delete("/:id", requireAuth, requireAdmin, remove); // Delete a product

export default router;
