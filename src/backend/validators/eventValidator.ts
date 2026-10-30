
import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(2).max(150),

  description: z
    .string()
    .trim()
    .max(2000)
    .nullable()
    .optional(),

  startsAt: z.string().datetime({ offset: true }),

  endsAt: z.string().datetime({ offset: true }),

  allDay: z.boolean().default(false),

  categoryId: z.string().uuid().nullable().optional(),
}).strict();

export const updateEventSchema =
  createEventSchema.partial();

export type CreateEventInput = z.infer<
  typeof createEventSchema
>;

export type UpdateEventInput = z.infer<
  typeof updateEventSchema
>;
