// Must run before Dexie initializes so it captures the IndexedDB API (ADR-002).
import "fake-indexeddb/auto";
import "@testing-library/jest-dom/vitest";
import Dexie from "dexie";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { useAppStore } from "@/app/model";
import { queryClient } from "@/app/providers/queryClient";
import { resetAuthMockState } from "./msw/handlers/auth";
import { server } from "./msw/server";

// jsdom's AbortSignal is not recognized by Node's undici Request (used by
// react-router data routers). The navigation Request's signal only aborts
// in-flight loaders; routes here have none, so strip an incompatible signal
// so the Request constructs. Test-environment only.
// Limitation: once data-router loaders exist, abort-on-navigation cannot be
// exercised through this patched Request — revisit this strip then.
const NativeRequest = globalThis.Request;
type RequestCtorArgs = ConstructorParameters<typeof globalThis.Request>;
let signalIncompatible = false;
try {
  new NativeRequest("http://probe.invalid/", {
    signal: new globalThis.AbortController().signal,
  });
} catch {
  signalIncompatible = true;
}
// CodeMirror measures text positions via Range.getClientRects in jsdom.
const RangeCtor = globalThis.Range;
if (RangeCtor && !RangeCtor.prototype.getClientRects) {
  RangeCtor.prototype.getClientRects = function getClientRects() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- jsdom stub for CodeMirror layout
    return [] as any;
  };
}

if (signalIncompatible) {
  class PatchedRequest extends NativeRequest {
    constructor(input: RequestCtorArgs[0], init?: RequestCtorArgs[1]) {
      if (init && init.signal != null) {
        const rest: RequestCtorArgs[1] = { ...init };
        delete rest.signal;
        super(input, rest);
        return;
      }
      super(input, init);
    }
  }
  Object.defineProperty(PatchedRequest, "name", { value: "Request" });
  globalThis.Request = PatchedRequest as unknown as typeof globalThis.Request;
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

// Reset the shared Zustand singleton between tests so suites stay isolated.
const initialStoreState = useAppStore.getInitialState();

// Drop any IndexedDB databases between tests so notebook persistence (Dexie)
// cannot leak state across test cases. Dexie.delete closes open connections.
async function clearIndexedDb() {
  const databases = (await globalThis.indexedDB.databases?.()) ?? [];
  await Promise.all(
    databases.map((database) =>
      database.name ? Dexie.delete(database.name) : Promise.resolve(),
    ),
  );
}

afterEach(async () => {
  server.resetHandlers();
  resetAuthMockState();
  queryClient.clear();
  cleanup();
  globalThis.localStorage.clear();
  useAppStore.setState(initialStoreState, true);
  await clearIndexedDb();
});
