import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { getDashboardSummary } from "../controllers/dashboard.controller";

const router = Router();

// Everyone can view the dashboard (Analysts, Admins, Viewers)
// The controller filters data appropriately based on their role
router.get("/summary", requireAuth, getDashboardSummary);

export default router;
