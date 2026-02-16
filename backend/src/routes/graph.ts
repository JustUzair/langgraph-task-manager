import express from "express";
import graphController from "../controllers/graph/index.js";

const router = express.Router();

router.post("/", graphController.startGraph);
router.post("/approve", graphController.resumeGraph);
export default router;
