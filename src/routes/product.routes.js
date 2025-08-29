import { Router } from "express";
import { list, getOne, create, update, remove } from "../controllers/product.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", list);
router.get("/:slug", getOne);
router.post("/", requireAuth, requireAdmin, create);
router.patch("/:id", requireAuth, requireAdmin, update);
router.delete("/:id", requireAuth, requireAdmin, remove);

export default router;