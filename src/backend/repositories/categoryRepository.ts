
import { prisma } from "@/backend/config/prisma";
import type {
  CategoryInput,
  UpdateCategoryInput,
} from "@/backend/validators/categoryValidator";

export const categoryRepository = {
  findAll(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
  },

  findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    });
  },

  findByName(name: string, userId: string) {
    return prisma.category.findUnique({
      where: {
        userId_name: { userId, name },
      },
    });
  },

  create(userId: string, data: CategoryInput) {
    return prisma.category.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  update(id: string, userId: string, data: UpdateCategoryInput) {
    return prisma.category.update({
      where: { id, userId },
      data,
    });
  },

  delete(id: string, userId: string) {
    return prisma.category.delete({
      where: { id, userId },
    });
  },
};
