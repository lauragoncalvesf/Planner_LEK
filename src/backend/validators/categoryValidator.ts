
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "A cor deve estar no formato hexadecimal.",
  }),
});

export const updateCategorySchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
