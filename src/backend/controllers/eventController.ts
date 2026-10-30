
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/backend/config/prisma";

import {
  createEventSchema,
  updateEventSchema,
} from "@/backend/validators/eventValidator";

import {
  eventService,
  EventNotFoundError,
  InvalidEventError,
} from "@/backend/services/eventService";

async function getUserId() {
  const session = await auth();

  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}

function handleError(error: unknown) {
  if (error instanceof EventNotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }

  if (error instanceof InvalidEventError) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return NextResponse.json(
      { error: "Compromisso não encontrado." },
      { status: 404 }
    );
  }

  console.error("Erro na API de eventos:", error);

  return NextResponse.json(
    { error: "Erro interno do servidor." },
    { status: 500 }
  );
}

export async function listEventsController() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const events = await eventService.list(userId);
    return NextResponse.json(events);
  } catch (error) {
    return handleError(error);
  }
}

export async function createEventController(
  request: Request
) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON inválido." },
      { status: 400 }
    );
  }

  const parsed = createEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dados do compromisso inválidos.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const event = await eventService.create(
      userId,
      parsed.data
    );

    return NextResponse.json(
      event,
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function getEventController(id: string) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const event = await eventService.getById(
      id,
      userId
    );

    return NextResponse.json(event);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateEventController(
  request: Request,
  id: string
) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "JSON inválido." },
      { status: 400 }
    );
  }

  const parsed = updateEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dados do compromisso inválidos.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const event = await eventService.update(
      id,
      userId,
      parsed.data
    );

    return NextResponse.json(event);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteEventController(
  id: string
) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const result = await eventService.delete(
      id,
      userId
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
