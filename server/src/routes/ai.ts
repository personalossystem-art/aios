import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { parseJD } from "../controllers/aiController";

const router = Router();

router.use(authenticate);
router.post("/parse", parseJD);

export default router;
