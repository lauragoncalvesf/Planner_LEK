
import { categoryRepository } from "@/backend/repositories/categoryRepository";
import type {
  CategoryInput,
  UpdateCategoryInput,
} from "@/backend/validators/categoryValidator";

export class CategoryNotFoundError extends Error {
  constructor() {
    super("Categoria não encontrada.");
  }
}

export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super("Você já possui uma categoria com esse nome.");
  }
}

export const categoryService = {
  list(userId: string) {
    return categoryRepository.findAll(userId);
  },

  async create(userId: string, data: CategoryInput) {
    const existing = await categoryRepository.findByName(
      data.name,
      userId
    );

    if (existing) {
      throw new CategoryAlreadyExistsError();
    }

    return categoryRepository.create(userId, data);
  },

  async update(
    id: string,
    userId: string,
    data: UpdateCategoryInput
  ) {
    const category = await categoryRepository.findById(
      id,
      userId
    );

    if (!category) {
      throw new CategoryNotFoundError();
    }

    if (data.name && data.name !== category.name) {
      const existing = await categoryRepository.findByName(
        data.name,
        userId
      );

      if (existing) {
        throw new CategoryAlreadyExistsError();
      }
    }

    return categoryRepository.update(id, userId, data);
  },

  async delete(id: string, userId: string) {
    const category = await categoryRepository.findById(
      id,
      userId
    );

    if (!category) {
      throw new CategoryNotFoundError();
    }

    return categoryRepository.delete(id, userId);
  },
};
