
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  RotateCcw,
  Trash2,
  Pencil,
  Clock3
} from "lucide-react";
import {
  getWeekDays,
  formatWeekRange,
  isSameDay,
} from "@/frontend/utils/calendarUtils";
import TaskModal from "@/frontend/components/tasks/TaskModal";
import { taskService, type Task } from "@/frontend/services/taskService";
import EventModal from "@/frontend/components/events/EventModal";
import {
  eventService,
  type CalendarEvent,
} from "@/frontend/services/eventService";

export default function WeeklyCalendar() {
  const [currentDate, setCurrentDate] = useState(
    () => new Date()
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksError, setTasksError] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  async function loadTasks() {
    try {
        setTasksError("");
        const data = await taskService.list();
        setTasks(data);
    } catch {
        setTasksError("Não foi possível carregar as tarefas.");
    }
  }


    async function toggleTaskStatus(task: Task) {
    try {
        setTasksError("");

        const newStatus =
        task.status === "COMPLETED" ? "PENDING" : "COMPLETED";

        await taskService.update(task.id, {
        status: newStatus,
        });

        await loadTasks();
    } catch (error) {
        setTasksError(
        error instanceof Error
            ? error.message
            : "Não foi possível atualizar a tarefa."
        );
    }
    }

    async function deleteTask(task: Task) {
        const confirmed = window.confirm(
            `Deseja realmente excluir a tarefa "${task.title}"?`
        );

        if (!confirmed) return;

        try {
            setTasksError("");

            await taskService.delete(task.id);
            await loadTasks();
        } catch (error) {
            setTasksError(
            error instanceof Error
                ? error.message
                : "Não foi possível excluir a tarefa."
            );
        }
    }

    async function loadEvents() {
        try {
            const data = await eventService.list();
            setEvents(data);
        } catch {
            setTasksError("Não foi possível carregar os compromissos.");
        }
    }

  
  useEffect(() => {
    void loadTasks();
    void loadEvents();
  }, []);


  const weekDays = getWeekDays(currentDate);
  const today = new Date();

  function changeWeek(amount: number) {
    setCurrentDate((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + amount * 7);
      return next;
    });
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="text-blue-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Minha semana
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {formatWeekRange(currentDate)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentDate(new Date())}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() => changeWeek(-1)}
            aria-label="Semana anterior"
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={() => changeWeek(1)}
            aria-label="Próxima semana"
            className="rounded-xl border border-slate-200 p-2 hover:bg-slate-50"
          >
            <ChevronRight size={19} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-1 md:gap-3">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className="min-w-0"
            >
              <div
                className={`mb-3 rounded-xl p-2 text-center ${
                  isToday
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 text-slate-700"
                }`}
              >
                <p className="text-xs capitalize">
                  {day.toLocaleDateString("pt-BR", {
                    weekday: "short",
                  })}
                </p>

                <p className="mt-1 text-sm font-bold md:text-lg">
                  {day.getDate()}
                </p>
              </div>

              <div className="min-h-48 rounded-xl border border-slate-100 bg-slate-50/50 p-1 md:min-h-80 md:p-2">

                {events
                .filter((event) => {
                    const start = new Date(event.startsAt);
                    const end = new Date(event.endsAt);

                    const dayStart = new Date(day);
                    dayStart.setHours(0, 0, 0, 0);

                    const dayEnd = new Date(dayStart);
                    dayEnd.setDate(dayEnd.getDate() + 1);

                    return start < dayEnd && end > dayStart;
                })
                .map((event) => (
                    <div
                    key={event.id}
                    className="mb-2 rounded-lg border-l-4 bg-violet-50 p-2 text-xs shadow-sm"
                    style={{
                        borderLeftColor: event.category?.color ?? "#7c3aed",
                    }}
                    >
                    <p className="break-words font-semibold text-slate-900">
                        {event.title}
                    </p>

                    <p className="mt-1 flex items-center gap-1 text-slate-600">
                        <Clock3 size={12} />
                        {event.allDay
                        ? "Dia inteiro"
                        : `${new Date(event.startsAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            })} – ${new Date(event.endsAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            })}`}
                    </p>

                    {event.category && (
                        <p className="mt-1 text-slate-500">
                        {event.category.name}
                        </p>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                        setEditingEvent(event);
                        setEventModalOpen(true);
                        }}
                        className="mt-2 text-xs font-medium text-violet-700 hover:underline"
                    >
                        Editar
                    </button>
                    </div>
                ))}


                {tasks
                .filter(
                    (task) =>
                    task.dueAt &&
                    isSameDay(new Date(task.dueAt), day)
                )
                .map((task) => (
                    <div
                    key={task.id}
                    className={`mb-2 rounded-lg border-l-4 bg-white p-2 text-xs shadow-sm ${
                        task.status === "COMPLETED" ? "opacity-60" : ""
                    }`}
                    style={{
                        borderLeftColor: task.category?.color ?? "#64748b",
                    }}
                    >
                    <p
                        className={`break-words font-semibold text-slate-800 ${
                        task.status === "COMPLETED"
                            ? "line-through"
                            : ""
                        }`}
                    >
                        {task.title}
                    </p>

                    <p className="mt-1 text-slate-500">
                        {new Date(task.dueAt!).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        })}
                    </p>

                    {task.category && (
                        <p className="mt-1 text-slate-500">
                        {task.category.name}
                        </p>
                    )}

                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2">
                        <button
                        type="button"
                        onClick={() => {
                            setEditingTask(task);
                            setModalOpen(true);
                        }}
                        title="Editar tarefa"
                        aria-label={`Editar ${task.title}`}
                        className="rounded-md p-1 text-blue-600 hover:bg-blue-50"
                        >
                        <Pencil size={16} />
                        </button>
                        <button
                        type="button"
                        onClick={() => void toggleTaskStatus(task)}
                        title={
                            task.status === "COMPLETED"
                            ? "Reabrir tarefa"
                            : "Concluir tarefa"
                        }
                        aria-label={
                            task.status === "COMPLETED"
                            ? `Reabrir ${task.title}`
                            : `Concluir ${task.title}`
                        }
                        className="rounded-md p-1 text-green-600 hover:bg-green-50"
                        >
                        {task.status === "COMPLETED" ? (
                            <RotateCcw size={16} />
                        ) : (
                            <CheckCircle2 size={16} />
                        )}
                        </button>

                        <button
                        type="button"
                        onClick={() => void deleteTask(task)}
                        title="Excluir tarefa"
                        aria-label={`Excluir ${task.title}`}
                        className="rounded-md p-1 text-red-500 hover:bg-red-50"
                        >
                        <Trash2 size={16} />
                        </button>
                    </div>
                    </div>
                ))}


              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Seus compromissos aparecerão aqui.
        </p>

        <button
        type="button"
        onClick={() => {
        setEditingTask(null);
        setModalOpen(true);
        }}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
        <Plus size={17} />
        Nova tarefa
        </button>

        <button
        type="button"
        onClick={() => {
            setEditingEvent(null);
            setEventModalOpen(true);
        }}
        className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
        <Clock3 size={17} />
        Novo compromisso
        </button>

      </div>

      {tasksError && (
        <p role="alert" className="mt-3 text-sm text-red-600">
            {tasksError}
        </p>
        )}


        <TaskModal
        open={modalOpen}
        task={editingTask}
        onClose={() => {
            setModalOpen(false);
            setEditingTask(null);
        }}
        onCreated={() => void loadTasks()}
        />

        <EventModal
        open={eventModalOpen}
        event={editingEvent}
        onClose={() => {
            setEventModalOpen(false);
            setEditingEvent(null);
        }}
        onSaved={() => void loadEvents()}
        />


    </section>
  );
}
