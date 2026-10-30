
import { prisma } from "@/backend/config/prisma";
import { eventRepository } from "@/backend/repositories/eventRepository";

import type {
  CreateEventInput,
  UpdateEventInput,
} from "@/backend/validators/eventValidator";

export class EventNotFoundError extends Error {
  constructor() {
    super("Compromisso não encontrado.");
  }
}

export class InvalidEventError extends Error {}

async function validateCategory(
  userId: string,
  categoryId?: string | null
) {
  if (!categoryId) return;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) {
    throw new InvalidEventError(
      "A categoria selecionada não pertence ao usuário."
    );
  }
}

function validatePeriod(
  startsAt: string,
  endsAt: string
) {
  if (new Date(endsAt) <= new Date(startsAt)) {
    throw new InvalidEventError(
      "O término deve ser posterior ao início."
    );
  }
}

export const eventService = {
  list(userId: string) {
    return eventRepository.findAll(userId);
  },

  async getById(id: string, userId: string) {
    const event = await eventRepository.findById(
      id,
      userId
    );

    if (!event) {
      throw new EventNotFoundError();
    }

    return event;
  },

  async create(
    userId: string,
    data: CreateEventInput
  ) {
    validatePeriod(data.startsAt, data.endsAt);

    await validateCategory(
      userId,
      data.categoryId
    );

    return eventRepository.create(userId, data);
  },

  async update(
    id: string,
    userId: string,
    data: UpdateEventInput
  ) {
    const current = await this.getById(id, userId);

    const startsAt =
      data.startsAt ?? current.startsAt.toISOString();

    const endsAt =
      data.endsAt ?? current.endsAt.toISOString();

    validatePeriod(startsAt, endsAt);

    await validateCategory(
      userId,
      data.categoryId
    );

    return eventRepository.update(
      id,
      userId,
      data
    );
  },

  async delete(id: string, userId: string) {
    await this.getById(id, userId);

    await eventRepository.delete(id, userId);

    return { success: true };
  },
};
