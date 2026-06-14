/**
 * Canary: rendering infrastructure — spec QA-UI-COMPONENT-TEST-INFRA §6.9
 *
 * Purpose: verify that the DOM environment, React, RTL, and jest-dom matchers
 * are all wired correctly.  This test must pass before any real product test
 * is written.
 *
 * Deleting this file must NOT break the test run (infra is independent, C5).
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@test/render";

describe("canary: rendering", () => {
  it("renders a React element into the DOM", () => {
    render(<div>ok</div>);
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("renders with providers wrapper without crashing", () => {
    render(
      <section aria-label="probe">
        <span>hello</span>
      </section>,
    );
    expect(screen.getByRole("region", { name: "probe" })).toBeInTheDocument();
    expect(screen.getByText("hello")).toBeVisible();
  });
});
