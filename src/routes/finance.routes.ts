import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import {
  createCategorySchema,
  createRecordSchema,
  getRecordsQuerySchema,
  updateRecordSchema,
} from "../schemas/finance.schema";
import {
  createCategory,
  getCategories,
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} from "../controllers/finance.controller";

const router = Router();

// ================= CATEGORIES =================
// Viewers, Analysts, Admins can GET
router.get("/categories", requireAuth, getCategories);
// Only Admins can POST
router.post(
  "/categories",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(createCategorySchema),
  createCategory,
);

// ================= RECORDS =================
// Analysts and Admins can GET. (Also filtering based on userID is enforced at controller layer).
router.get(
  "/records",
  requireAuth,
  requireRole(["ADMIN", "ANALYST"]),
  validateRequest(getRecordsQuerySchema),
  getRecords,
);

// Only Admins can create or modify records
router.post(
  "/records",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(createRecordSchema),
  createRecord,
);

router.patch(
  "/records/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(updateRecordSchema),
  updateRecord,
);

router.delete(
  "/records/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  deleteRecord,
);

export default router;
