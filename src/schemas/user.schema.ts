import { z } from "zod";

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["VIEWER", "ANALYST", "ADMIN"] as const, {
      error: (issue) =>
        issue.input === undefined
          ? "Role is required"
          : "Role must be VIEWER, ANALYST, or ADMIN",
    }),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "INACTIVE"] as const, {
      error: (issue) =>
        issue.input === undefined
          ? "Status is required"
          : "Status must be ACTIVE or INACTIVE",
    }),
  }),
});
