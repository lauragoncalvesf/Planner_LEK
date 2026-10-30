
export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  allDay: boolean;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export type EventInput = {
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
  categoryId?: string | null;
};

async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Erro ao processar compromisso.");
  }

  return data;
}

export const eventService = {
  async list(): Promise<CalendarEvent[]> {
    const response = await fetch("/api/events", {
      cache: "no-store",
    });

    return handleResponse(response);
  },

  async create(data: EventInput): Promise<CalendarEvent> {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  async update(
    id: string,
    data: Partial<EventInput>
  ): Promise<CalendarEvent> {
    const response = await fetch(`/api/events/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });

    await handleResponse(response);
  },
};
