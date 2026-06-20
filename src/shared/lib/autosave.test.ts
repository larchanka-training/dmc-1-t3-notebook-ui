import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAutosaver } from "./autosave";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createAutosaver", () => {
  it("saves once after the debounce window for rapid changes", () => {
    const save = vi.fn();
    const autosaver = createAutosaver({ save, delayMs: 500 });

    autosaver.schedule("a");
    autosaver.schedule("b");
    autosaver.schedule("c");
    expect(save).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith("c");
  });

  it("does not save before the window elapses", () => {
    const save = vi.fn();
    const autosaver = createAutosaver({ save, delayMs: 500 });

    autosaver.schedule("a");
    vi.advanceTimersByTime(499);
    expect(save).not.toHaveBeenCalled();
  });

  it("flushes the pending value immediately and does not double-save", async () => {
    const save = vi.fn();
    const autosaver = createAutosaver({ save, delayMs: 500 });

    autosaver.schedule("x");
    await autosaver.flush();
    expect(save).toHaveBeenCalledWith("x");

    vi.advanceTimersByTime(500);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("cancel prevents a pending save", () => {
    const save = vi.fn();
    const autosaver = createAutosaver({ save, delayMs: 500 });

    autosaver.schedule("x");
    autosaver.cancel();
    vi.advanceTimersByTime(500);
    expect(save).not.toHaveBeenCalled();
  });

  it("schedules a new save after a previous one fired", () => {
    const save = vi.fn();
    const autosaver = createAutosaver({ save, delayMs: 500 });

    autosaver.schedule("a");
    vi.advanceTimersByTime(500);
    autosaver.schedule("b");
    vi.advanceTimersByTime(500);

    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith("b");
  });
});
