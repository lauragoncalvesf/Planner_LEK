
import {
  getEventController,
  updateEventController,
  deleteEventController,
} from "@/backend/controllers/eventController";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return getEventController(id);
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return updateEventController(request, id);
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return deleteEventController(id);
}
