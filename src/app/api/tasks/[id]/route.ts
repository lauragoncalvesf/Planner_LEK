
import {
  getTaskController,
  updateTaskController,
  deleteTaskController,
} from "@/backend/controllers/taskController";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return getTaskController(id);
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return updateTaskController(request, id);
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return deleteTaskController(id);
}
