import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
  }),
});

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    type: z.enum(["INCOME", "EXPENSE"] as const, {
      error: "Type must be INCOME or EXPENSE",
    }),
    date: z.iso.datetime().optional(),
    description: z.string().optional(),
    categoryId: z.uuid("Invalid category ID"),
  }),
});

export const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive().optional(),
    type: z.enum(["INCOME", "EXPENSE"] as const).optional(),
    date: z.iso.datetime().optional(),
    description: z.string().optional(),
    categoryId: z.uuid().optional(),
  }),
});

export const getRecordsQuerySchema = z.object({
  query: z.object({
    type: z.enum(["INCOME", "EXPENSE"] as const).optional(),
    categoryId: z.uuid().optional(),
    startDate: z.iso.datetime().optional(),
    endDate: z.iso.datetime().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
