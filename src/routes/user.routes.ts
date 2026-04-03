import { Router } from "express";
import { getUsers, updateUserRole, updateUserStatus } from "../controllers/user.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { updateUserRoleSchema, updateUserStatusSchema } from "../schemas/user.schema";

const router = Router();

// Only ADMIN and ANALYST can view users
router.get("/", requireAuth, requireRole(["ADMIN", "ANALYST"]), getUsers);

// Only ADMIN can change roles and statuses
router.patch("/:id/role", requireAuth, requireRole(["ADMIN"]), validateRequest(updateUserRoleSchema), updateUserRole);

router.patch("/:id/status", requireAuth, requireRole(["ADMIN"]), validateRequest(updateUserStatusSchema), updateUserStatus);

export default router;
