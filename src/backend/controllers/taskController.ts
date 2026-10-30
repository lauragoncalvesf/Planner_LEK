
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/backend/config/prisma";
import {
  createTaskSchema,
  updateTaskSchema,
} from "@/backend/validators/taskValidator";
import {
  taskService,
  TaskNotFoundError,
  InvalidTaskError,
} from "@/backend/services/taskService";

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
  if (error instanceof TaskNotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }

  if (error instanceof InvalidTaskError) {
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
      { error: "Tarefa não encontrada." },
      { status: 404 }
    );
  }

  console.error("Erro na API de tarefas:", error);

  return NextResponse.json(
    { error: "Erro interno do servidor." },
    { status: 500 }
  );
}

export async function listTasksController() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const tasks = await taskService.list(userId);
    return NextResponse.json(tasks);
  } catch (error) {
    return handleError(error);
  }
}

export async function createTaskController(request: Request) {
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

  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dados da tarefa inválidos.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const task = await taskService.create(
      userId,
      parsed.data
    );

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function getTaskController(id: string) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const task = await taskService.getById(id, userId);
    return NextResponse.json(task);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateTaskController(
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

  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dados da tarefa inválidos.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const task = await taskService.update(
      id,
      userId,
      parsed.data
    );

    return NextResponse.json(task);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteTaskController(id: string) {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "Não autorizado." },
      { status: 401 }
    );
  }

  try {
    const result = await taskService.delete(id, userId);
    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}
