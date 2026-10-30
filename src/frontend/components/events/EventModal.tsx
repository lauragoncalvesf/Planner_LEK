
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  eventService,
  type CalendarEvent,
} from "@/frontend/services/eventService";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Props = {
  open: boolean;
  event?: CalendarEvent | null;
  onClose: () => void;
  onSaved: () => void;
};

function toLocalInput(value: string) {
  const date = new Date(value);
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

export default function EventModal({
  open,
  event,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setTitle(event?.title ?? "");
    setDescription(event?.description ?? "");
    setStartsAt(event ? toLocalInput(event.startsAt) : "");
    setEndsAt(event ? toLocalInput(event.endsAt) : "");
    setAllDay(event?.allDay ?? false);
    setCategoryId(event?.categoryId ?? "");
    setError("");
  }, [open, event]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    async function loadCategories() {
      try {
        const response = await fetch("/api/categories", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar categorias.");
        }

        const data: Category[] = await response.json();

        if (active) {
          setCategories(data);
        }
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!startsAt || !endsAt) {
      setError("Informe o início e o término.");
      return;
    }

    const start = new Date(startsAt);
    const end = new Date(endsAt);

    if (
      !Number.isFinite(start.getTime()) ||
      !Number.isFinite(end.getTime()) ||
      end <= start
    ) {
      setError("O término deve ser posterior ao início.");
      return;
    }

    setLoading(true);

    try {
      const data = {
        title: title.trim(),
        description: description.trim() || null,
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        allDay,
        categoryId: categoryId || null,
      };

      if (event) {
        await eventService.update(event.id, data);
      } else {
        await eventService.create(data);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o compromisso."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 text-slate-900 shadow-xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="event-modal-title"
            className="text-xl font-bold"
          >
            {event ? "Editar compromisso" : "Novo compromisso"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Fechar"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="event-title"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Título *
            </label>

            <input
              id="event-title"
              required
              minLength={2}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Reunião de projeto"
              className={fieldClass}
            />
          </div>

          <div>
            <label
              htmlFor="event-description"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Descrição
            </label>

            <textarea
              id="event-description"
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="event-start"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Início *
              </label>

              <input
                id="event-start"
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label
                htmlFor="event-end"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Término *
              </label>

              <input
                id="event-end"
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            Evento de dia inteiro
          </label>

          <div>
            <label
              htmlFor="event-category"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Categoria
            </label>

            <select
              id="event-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Sem categoria</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {loading
                ? "Salvando..."
                : event
                  ? "Salvar alterações"
                  : "Criar compromisso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
