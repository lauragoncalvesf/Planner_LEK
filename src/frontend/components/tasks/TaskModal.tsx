
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  taskService,
  type Task,
  type TaskPriority,
} from "@/frontend/services/taskService";
type Category = {
  id: string;
  name: string;
  color: string;
};

type TaskModalProps = {
  open: boolean;
  task?: Task | null;
  onClose: () => void;
  onCreated: () => void;
};

export default function TaskModal({
  open,
  task,
  onClose,
  onCreated,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [categoryId, setCategoryId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Não foi possível carregar as categorias.");
        }

        const data: Category[] = await response.json();

        if (active) setCategories(data);
      } catch {
        if (active) {
          setError("Não foi possível carregar as categorias.");
        }
      }
    }

    void loadCategories();

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "MEDIUM");
    setCategoryId(task?.categoryId ?? "");
    setDueAt(
        task?.dueAt
        ? toLocalDateTimeInput(new Date(task.dueAt))
        : ""
    );
    setError("");
    }, [open, task]);
    
  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
        const formData = {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        categoryId: categoryId || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        };

        if (task) {
        await taskService.update(task.id, formData);
        } else {
        await taskService.create(formData);
        }


      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setCategoryId("");
      setDueAt("");

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao criar tarefa."
      );
    } finally {
      setLoading(false);
    }
  }
  


    function toLocalDateTimeInput(date: Date): string {
    const local = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
    }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="task-modal-title"
            className="text-xl font-bold text-slate-900"
          >
            {task ? "Editar tarefa" : "Nova tarefa"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Título *
            </label>

            <input
              id="task-title"
              required
              minLength={2}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Estudar para a prova"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Descrição
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Detalhes da tarefa..."
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-priority"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Prioridade
              </label>

              <select
                id="task-priority"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as TaskPriority)
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-3"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="task-category"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Categoria
              </label>

              <select
                id="task-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-3"
              >
                <option value="">Sem categoria</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="task-due"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Data e horário de vencimento
            </label>

            <input
              id="task-due"
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
            {loading
            ? "Salvando..."
            : task
                ? "Salvar alterações"
                : "Criar tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
