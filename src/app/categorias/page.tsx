
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tags } from "lucide-react";
import CategoryManager from "@/frontend/components/categories/CategoryManager";

export default async function CategoriasPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Voltar ao dashboard
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
            <Tags size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Minhas categorias
            </h1>
            <p className="mt-1 text-slate-500">
              Crie, edite e organize as categorias da sua rotina.
            </p>
          </div>
        </div>

        <CategoryManager />
      </div>
    </main>
  );
}
