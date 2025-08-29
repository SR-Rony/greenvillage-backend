import { Router } from "express";
import { list, create, remove } from "../controllers/category.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", list);
router.post("/", requireAuth, requireAdmin, create);
router.delete("/:id", requireAuth, requireAdmin, remove);

export default router;