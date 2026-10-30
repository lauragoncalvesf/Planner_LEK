
import { prisma } from "@/backend/config/prisma";
import { taskRepository } from "@/backend/repositories/taskRepository";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/backend/validators/taskValidator";

export class TaskNotFoundError extends Error {
  constructor() {
    super("Tarefa não encontrada.");
  }
}

export class InvalidTaskError extends Error {}

async function validateCategory(
  userId: string,
  categoryId?: string | null
) {
  if (!categoryId) return;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new InvalidTaskError(
      "A categoria selecionada não pertence ao usuário."
    );
  }
}

function validateSchedule(
  start?: string | null,
  end?: string | null
) {
  if (start && end && new Date(end) <= new Date(start)) {
    throw new InvalidTaskError(
      "O horário final deve ser posterior ao inicial."
    );
  }
}

export const taskService = {
  list(userId: string) {
    return taskRepository.findAll(userId);
  },

  async getById(id: string, userId: string) {
    const task = await taskRepository.findById(id, userId);

    if (!task) throw new TaskNotFoundError();

    return task;
  },

  async create(userId: string, data: CreateTaskInput) {
    await validateCategory(userId, data.categoryId);

    validateSchedule(
      data.scheduledStartAt,
      data.scheduledEndAt
    );

    return taskRepository.create(userId, data);
  },

  async update(
    id: string,
    userId: string,
    data: UpdateTaskInput
  ) {
    const current = await this.getById(id, userId);

    await validateCategory(userId, data.categoryId);

    const start =
      data.scheduledStartAt === undefined
        ? current.scheduledStartAt?.toISOString()
        : data.scheduledStartAt;

    const end =
      data.scheduledEndAt === undefined
        ? current.scheduledEndAt?.toISOString()
        : data.scheduledEndAt;

    validateSchedule(start, end);

    if (data.status === "COMPLETED") {
        data.completedAt = new Date().toISOString();
        } else if (data.status !== undefined) {
        data.completedAt = null;
        }

    return taskRepository.update(id, userId, data);
  },

  async delete(id: string, userId: string) {
    await this.getById(id, userId);
    await taskRepository.delete(id, userId);

    return { success: true };
  },
};
