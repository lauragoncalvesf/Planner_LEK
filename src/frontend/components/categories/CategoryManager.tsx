
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  categoryApi,
  type Category,
} from "@/frontend/services/categoryService";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  LoaderCircle,
  Tags,
} from "lucide-react";

const colors = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#64748B",
];

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState(colors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setError("");
      const data = await categoryApi.list();
      setCategories(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar categorias."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function resetForm() {
    setName("");
    setColor(colors[0]);
    setEditingId(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editingId) {
        await categoryApi.update(editingId, { name, color });
        setSuccess("Categoria atualizada com sucesso!");
      } else {
        await categoryApi.create({ name, color });
        setSuccess("Categoria criada com sucesso!");
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar categoria."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
    setError("");
    setSuccess("");
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Excluir a categoria "${category.name}"? As tarefas e os compromissos serão mantidos sem categoria.`
    );

    if (!confirmed) return;

    setDeletingId(category.id);
    setError("");
    setSuccess("");

    try {
      await categoryApi.remove(category.id);
      if (editingId === category.id) resetForm();
      await loadCategories();
      setSuccess("Categoria excluída com sucesso!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao excluir categoria."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            {editingId ? "Editar categoria" : "Nova categoria"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Personalize as áreas da sua rotina.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="category-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Nome da categoria
            </label>
            <input
              id="category-name"
              required
              minLength={2}
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Trabalho, Academia, Faculdade"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">
              Escolha uma cor
            </p>
            <div className="flex flex-wrap gap-3">
              {colors.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setColor(item)}
                  aria-label={`Selecionar cor ${item}`}
                  aria-pressed={color === item}
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform hover:scale-110"
                  style={{ backgroundColor: item }}
                >
                  {color === item && <Check size={20} color="white" />}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor="custom-color"
                className="text-sm text-slate-600"
              >
                Ou escolha outra cor:
              </label>
              <input
                id="custom-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-12 cursor-pointer"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle className="animate-spin" size={18} />
              ) : editingId ? (
                <Check size={18} />
              ) : (
                <Plus size={18} />
              )}
              {saving
                ? "Salvando..."
                : editingId
                  ? "Salvar alterações"
                  : "Criar categoria"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-3 text-slate-700"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Minhas categorias
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Organize suas atividades por cores.
            </p>
          </div>
          <span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
            {categories.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <LoaderCircle className="animate-spin" size={18} />
            Carregando categorias...
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
            <Tags className="mx-auto mb-3 text-slate-400" size={32} />
            <p className="font-medium text-slate-700">
              Nenhuma categoria ainda
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Crie sua primeira categoria para começar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="truncate font-medium text-slate-800">
                    {category.name}
                  </span>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(category)}
                    aria-label={`Editar ${category.name}`}
                    className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    disabled={deletingId === category.id}
                    aria-label={`Excluir ${category.name}`}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {deletingId === category.id ? (
                      <LoaderCircle className="animate-spin" size={17} />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
