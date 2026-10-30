
import { prisma } from "@/backend/config/prisma";
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/backend/validators/taskValidator";

const taskInclude = {
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
} as const;

export const taskRepository = {
  findAll(userId: string) {
    return prisma.task.findMany({
      where: { userId },
      include: taskInclude,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string, userId: string) {
    return prisma.task.findFirst({
      where: { id, userId },
      include: taskInclude,
    });
  },

  create(userId: string, data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        status: data.status,
        userId,
        categoryId: data.categoryId ?? null,

        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        scheduledStartAt: data.scheduledStartAt
          ? new Date(data.scheduledStartAt)
          : null,
        scheduledEndAt: data.scheduledEndAt
          ? new Date(data.scheduledEndAt)
          : null,

        completedAt:
          data.status === "COMPLETED" ? new Date() : null,
      },
      include: taskInclude,
    });
  },

  update(
    id: string,
    userId: string,
    data: UpdateTaskInput
  ) {
    const updateData = {
      ...data,
      dueAt:
        data.dueAt === undefined
          ? undefined
          : data.dueAt === null
            ? null
            : new Date(data.dueAt),

      scheduledStartAt:
        data.scheduledStartAt === undefined
          ? undefined
          : data.scheduledStartAt === null
            ? null
            : new Date(data.scheduledStartAt),

      scheduledEndAt:
        data.scheduledEndAt === undefined
          ? undefined
          : data.scheduledEndAt === null
            ? null
            : new Date(data.scheduledEndAt),

      completedAt:
        data.completedAt === undefined
          ? undefined
          : data.completedAt === null
            ? null
            : new Date(data.completedAt),
    };

    return prisma.task.update({
      where: { id, userId },
      data: updateData,
      include: taskInclude,
    });
  },

  delete(id: string, userId: string) {
    return prisma.task.delete({
      where: { id, userId },
    });
  },
};
