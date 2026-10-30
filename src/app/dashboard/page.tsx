import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, CalendarRange, CheckCircle2, Tags } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  // Impede o acesso de usuários não autenticados
  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={28} />

            <h1 className="text-2xl font-bold text-slate-900">
              LEK<span className="text-blue-600">.</span>
            </h1>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Sair
            </button>
          </form>
        </header>

        <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-white">
          <p className="text-sm text-blue-100">
            Seu espaço de organização
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Olá, {session.user.name || "bem-vinda"}!
          </h2>

          <p className="mt-3 text-blue-100">
            Vamos organizar sua semana?
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" />

            <div>
              <h3 className="font-semibold text-slate-900">
                Login realizado com sucesso!
              </h3>

              <p className="text-sm text-slate-500">
                Sua conta está autenticada e pronta para usar o LEK.
              </p>
            </div>
          </div>
        </div>

        <Link
        href="/categorias"
        className="mt-6 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >
        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
            <Tags size={24} />
        </div>
        <div>
            <h3 className="font-semibold text-slate-900">
            Gerenciar categorias
            </h3>
            <p className="text-sm text-slate-500">
            Personalize sua rotina com nomes e cores.
            </p>
        </div>
        </Link>


        <Link
        href="/calendario"
        className="mt-4 flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
        >
        <div className="rounded-xl bg-violet-100 p-3 text-violet-600">
            <CalendarRange size={24} />
        </div>

        <div>
            <h3 className="font-semibold text-slate-900">
            Meu calendário
            </h3>

            <p className="text-sm text-slate-500">
            Visualize e organize sua semana.
            </p>
        </div>
        </Link>


      </div>
    </main>
  );
}
