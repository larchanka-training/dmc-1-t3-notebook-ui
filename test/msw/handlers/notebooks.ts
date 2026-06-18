import { http, HttpResponse } from "msw";
import type { ServerNotebook, ServerNotebookSummary } from "@/entities/notebook";

const TEST_API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8000/api/v1";
const API = `${TEST_API_BASE}/notebooks`;

let listResponse: ServerNotebookSummary[] = [];
const notebooks = new Map<string, ServerNotebook>();

export function setMockServerNotebooks(summaries: ServerNotebookSummary[]) {
  listResponse = summaries;
}

export function setMockServerNotebook(notebook: ServerNotebook) {
  notebooks.set(notebook.id, notebook);
}

export function resetNotebooksMockState() {
  listResponse = [];
  notebooks.clear();
}

export const notebooksHandlers = [
  http.get(API, () => HttpResponse.json(listResponse)),
  http.get(`${API}/:id`, ({ params }) => {
    const notebook = notebooks.get(params.id as string);
    if (!notebook) {
      return HttpResponse.json(
        { error: { code: "not_found", message: "Notebook not found" } },
        { status: 404 },
      );
    }
    return HttpResponse.json(notebook);
  }),
];
