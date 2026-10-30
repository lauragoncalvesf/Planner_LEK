
import {
  updateCategoryController,
  deleteCategoryController,
} from "@/backend/controllers/categoryController";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return updateCategoryController(request, id);
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;
  return deleteCategoryController(id);
}
