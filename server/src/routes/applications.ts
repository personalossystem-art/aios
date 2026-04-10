import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  updateStatus,
} from "../controllers/applicationController";

const router = Router();

router.use(authenticate);

router.get("/", getApplications);
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.patch("/:id/status", updateStatus);

export default router;
