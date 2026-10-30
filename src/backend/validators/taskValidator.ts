
import { z } from "zod";

const dateField = z
  .string()
  .datetime({ offset: true })
  .nullable()
  .optional();

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(2).max(150),
    description: z.string().trim().max(2000).nullable().optional(),

    priority: z
      .enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .default("MEDIUM"),

    status: z
      .enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
      .default("PENDING"),

    categoryId: z.string().uuid().nullable().optional(),

    dueAt: dateField,
    scheduledStartAt: dateField,
    scheduledEndAt: dateField,
  })
  .strict();

export const updateTaskSchema = createTaskSchema
  .safeExtend({
    completedAt: dateField,
  })
  .partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
