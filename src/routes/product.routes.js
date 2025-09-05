import express from "express";
import { create, list, getOne, update, remove } from "../controllers/product.controller.js";
import { upload } from "../middlewares/upload.js";
// import { create, list, getOne, update, remove } from "../controllers/product.js";
// import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.get("/", list);
router.get("/:id", getOne);
router.post("/", create); // images field
router.put("/:id", update); // optional
router.delete("/:id", remove);

export default router;
