
import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import {
  userService,
  EmailAlreadyExistsError,
} from "@/backend/services/userService";
import { registerSchema } from "@/backend/validators/registerValidator";

export async function registerController(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos. Verifique os campos." },
        { status: 400 }
      );
    }

    const user = await userService.register(parsed.data);

    return NextResponse.json(
      { message: "Conta criada com sucesso!", user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "JSON inválido." },
        { status: 400 }
      );
    }

    if (
      error instanceof EmailAlreadyExistsError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002")
    ) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    console.error("Erro no cadastro:", error);

    return NextResponse.json(
      { error: "Erro interno ao criar conta." },
      { status: 500 }
    );
  }
}
