
export type Category = {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
};

type CategoryData = {
  name: string;
  color: string;
};

async function handleResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro ao processar solicitação.");
  }

  return data;
}

export const categoryApi = {
  async list(): Promise<Category[]> {
    const response = await fetch("/api/categories", {
      cache: "no-store",
    });
    return handleResponse(response);
  },

  async create(data: CategoryData): Promise<Category> {
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(
    id: string,
    data: CategoryData
  ): Promise<Category> {
    const response = await fetch(
      `/api/categories/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    return handleResponse(response);
  },

  async remove(id: string): Promise<void> {
    const response = await fetch(
      `/api/categories/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
    await handleResponse(response);
  },
};
