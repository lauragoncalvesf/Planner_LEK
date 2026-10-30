
import { auth } from "@/auth";
import { prisma } from "@/backend/config/prisma";
import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import {
  categoryService,
  CategoryNotFoundError,
  CategoryAlreadyExistsError,
} from "@/backend/services/categoryService";
import {
  categorySchema,
  updateCategorySchema,
} from "@/backend/validators/categoryValidator";

async function getUserId() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}

function handleError(error: unknown) {
  if (error instanceof CategoryNotFoundError) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }

  if (
    error instanceof CategoryAlreadyExistsError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002")
  ) {
    return NextResponse.json(
      { error: "Você já possui uma categoria com esse nome." },
      { status: 409 }
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return NextResponse.json(
      { error: "Categoria não encontrada." },
      { status: 404 }
    );
  }

  console.error("Erro nas categorias:", error);

  return NextResponse.json(
    { error: "Erro interno do servidor." },
    { status: 500 }
  );
}

export async function listCategoriesController() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const categories = await categoryService.list(userId);

    return NextResponse.json(categories);
  } catch (error) {
    return handleError(error);
  }
}

export async function createCategoryController(request: Request) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Nome ou cor inválidos." },
        { status: 400 }
      );
    }

    const category = await categoryService.create(
      userId,
      parsed.data
    );

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "JSON inválido." },
        { status: 400 }
      );
    }

    return handleError(error);
  }
}

export async function updateCategoryController(
  request: Request,
  id: string
) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos." },
        { status: 400 }
      );
    }

    const category = await categoryService.update(
      id,
      userId,
      parsed.data
    );

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "JSON inválido." },
        { status: 400 }
      );
    }

    return handleError(error);
  }
}

export async function deleteCategoryController(id: string) {
  try {
    const userId = await getUserId();

    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado." },
        { status: 401 }
      );
    }

    // Não apagamos tarefas nem compromissos.
    // Removemos somente a associação à categoria.
    await prisma.$transaction(async (tx) => {
      const category = await tx.category.findFirst({
        where: { id, userId },
      });

      if (!category) {
        throw new CategoryNotFoundError();
      }

      await tx.task.updateMany({
        where: { categoryId: id, userId },
        data: { categoryId: null },
      });

      await tx.event.updateMany({
        where: { categoryId: id, userId },
        data: { categoryId: null },
      });

      await tx.category.delete({
        where: { id, userId },
      });
    });

    return NextResponse.json({
      message: "Categoria excluída com sucesso.",
    });
  } catch (error) {
    return handleError(error);
  }
}
