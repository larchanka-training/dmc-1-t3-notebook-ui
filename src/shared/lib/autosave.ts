/** Debounced autosaver: coalesces rapid `schedule` calls into one `save`. */
export type Autosaver<T> = {
  /** Queue `value` to be saved after the debounce window; resets the timer. */
  schedule(value: T): void;
  /** Save the pending value immediately (if any) and clear the timer. */
  flush(): Promise<void>;
  /** Drop the pending value and timer without saving. */
  cancel(): void;
};

/**
 * Create a debounced autosaver. Rapid `schedule(value)` calls within `delayMs`
 * collapse into a single `save` of the latest value, so editing does not save
 * on every keystroke.
 */
export function createAutosaver<T>(options: {
  save: (value: T) => void | Promise<void>;
  delayMs: number;
}): Autosaver<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: { value: T } | undefined;

  const clearTimer = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  return {
    schedule(value) {
      pending = { value };
      clearTimer();
      timer = setTimeout(() => {
        timer = undefined;
        const captured = pending;
        pending = undefined;
        if (captured) {
          void options.save(captured.value);
        }
      }, options.delayMs);
    },
    async flush() {
      clearTimer();
      const captured = pending;
      pending = undefined;
      if (captured) {
        await options.save(captured.value);
      }
    },
    cancel() {
      clearTimer();
      pending = undefined;
    },
  };
}
