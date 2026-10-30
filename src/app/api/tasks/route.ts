
import {
  listTasksController,
  createTaskController,
} from "@/backend/controllers/taskController";

export const GET = listTasksController;
export const POST = createTaskController;
