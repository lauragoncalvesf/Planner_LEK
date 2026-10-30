
import { prisma } from "@/backend/config/prisma";

import type {
  CreateEventInput,
  UpdateEventInput,
} from "@/backend/validators/eventValidator";

const eventInclude = {
  category: {
    select: {
      id: true,
      name: true,
      color: true,
    },
  },
} as const;

export const eventRepository = {
  findAll(userId: string) {
    return prisma.event.findMany({
      where: {
        userId,
        recurrenceType: "NONE",
      },
      include: eventInclude,
      orderBy: { startsAt: "asc" },
    });
  },

  findById(id: string, userId: string) {
    return prisma.event.findFirst({
      where: { id, userId },
      include: eventInclude,
    });
  },

  create(userId: string, data: CreateEventInput) {
    return prisma.event.create({
      data: {
        userId,
        title: data.title,
        description: data.description ?? null,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
        allDay: data.allDay,
        categoryId: data.categoryId ?? null,
        recurrenceType: "NONE",
      },
      include: eventInclude,
    });
  },

  update(
    id: string,
    userId: string,
    data: UpdateEventInput
  ) {
    return prisma.event.update({
      where: { id, userId },
      data: {
        title: data.title,
        description: data.description,
        startsAt: data.startsAt
          ? new Date(data.startsAt)
          : undefined,
        endsAt: data.endsAt
          ? new Date(data.endsAt)
          : undefined,
        allDay: data.allDay,
        categoryId: data.categoryId,
      },
      include: eventInclude,
    });
  },

  delete(id: string, userId: string) {
    return prisma.event.delete({
      where: { id, userId },
    });
  },
};
