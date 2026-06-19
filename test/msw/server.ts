import { setupServer } from "msw/node";
import { authHandlers } from "./handlers/auth";
import { notebooksHandlers } from "./handlers/notebooks";

export const server = setupServer(...authHandlers, ...notebooksHandlers);
