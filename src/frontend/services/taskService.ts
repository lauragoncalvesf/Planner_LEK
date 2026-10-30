
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  categoryId: string | null;
  dueAt: string | null;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  completedAt: string | null;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export type CreateTaskData = {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  categoryId?: string | null;
  dueAt?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
};

async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Erro ao processar tarefa.");
  }

  return data;
}

export const taskService = {
  async list(): Promise<Task[]> {
    const response = await fetch("/api/tasks", {
      cache: "no-store",
    });

    return handleResponse(response);
  },

  async create(data: CreateTaskData): Promise<Task> {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  async update(
    id: string,
    data: Partial<CreateTaskData> & {
      status?: TaskStatus;
    }
  ): Promise<Task> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    await handleResponse(response);
  },
};
