/// <reference lib="webworker" />

import type { AppToRuntimeMessage } from "../model/types";
import { createNotebookRuntimeCore } from "./notebookRuntimeCore";

const runtime = createNotebookRuntimeCore((message) => {
  self.postMessage(message);
});

self.onmessage = (event: MessageEvent<AppToRuntimeMessage>) => {
  const message = event.data;

  switch (message.type) {
    case "RUN_BLOCKS": {
      void runtime.runBlocks(message.executionId, message.blocks);
      break;
    }
    case "RESET_SESSION": {
      runtime.resetSession();
      break;
    }
    case "TERMINATE_SESSION": {
      runtime.terminateSession();
      self.close();
      break;
    }
  }
};

export {};
