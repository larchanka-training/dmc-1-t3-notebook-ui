import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { useAppStore } from "../store";

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
    signal: new globalThis.AbortController().signal
  });
} catch {
  signalIncompatible = true;
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

// Reset the shared Zustand singleton between tests so suites stay isolated.
const initialStoreState = useAppStore.getInitialState();

afterEach(() => {
  cleanup();
  globalThis.localStorage.clear();
  useAppStore.setState(initialStoreState, true);
});
