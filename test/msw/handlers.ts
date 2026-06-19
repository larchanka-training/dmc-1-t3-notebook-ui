/**
 * MSW handler registry — spec QA-UI-COMPONENT-TEST-INFRA §6.6
 *
 * This file is the aggregation point for all MSW request handlers used in
 * component tests.  The MSW server in server.ts spreads this array.
 *
 * Convention:
 *   - Group handlers by feature area in separate files under ./handlers/
 *   - Import and include them in the `handlers` array below
 *   - Override a specific handler per-test with server.use(http.get(...))
 *
 * TODO: add handler modules as backend endpoints are implemented:
 *   - sync            → ./handlers/sync.ts
 *   - AI broker       → ./handlers/ai.ts
 */
import type { RequestHandler } from "msw";
import { authHandlers } from "./handlers/auth";
import { notebooksHandlers } from "./handlers/notebooks";

export const handlers: RequestHandler[] = [...authHandlers, ...notebooksHandlers];
