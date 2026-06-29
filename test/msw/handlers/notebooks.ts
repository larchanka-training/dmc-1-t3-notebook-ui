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
  http.patch(`${API}/:id`, async ({ params, request }) => {
    const notebook = notebooks.get(params.id as string);
    if (!notebook) {
      return HttpResponse.json(
        { error: { code: "not_found", message: "Notebook not found" } },
        { status: 404 },
      );
    }

    const payload = (await request.json()) as { title?: string };
    const title = payload.title?.trim() || notebook.title;
    const updatedNotebook: ServerNotebook = {
      ...notebook,
      title,
      updated_at: new Date().toISOString(),
    };
    notebooks.set(updatedNotebook.id, updatedNotebook);
    listResponse = listResponse.map((summary) =>
      summary.id === updatedNotebook.id
        ? {
            ...summary,
            title: updatedNotebook.title,
            updated_at: updatedNotebook.updated_at,
          }
        : summary,
    );

    return HttpResponse.json(updatedNotebook);
  }),
  http.delete(`${API}/:id`, ({ params }) => {
    const notebookId = params.id as string;
    if (
      !notebooks.has(notebookId) &&
      !listResponse.some((summary) => summary.id === notebookId)
    ) {
      return HttpResponse.json(
        { error: { code: "not_found", message: "Notebook not found" } },
        { status: 404 },
      );
    }

    notebooks.delete(notebookId);
    listResponse = listResponse.filter((summary) => summary.id !== notebookId);
    return new HttpResponse(null, { status: 204 });
  }),
];
