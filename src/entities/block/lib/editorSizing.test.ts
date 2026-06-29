import { describe, expect, it } from "vitest";
import {
  getCodeBlockHeight,
  getCodeBlockMaxHeight,
  getCodeBlockMinHeight,
  getTextBlockHeight,
  isTextBlockScrollable,
} from "./editorSizing";

describe("editorSizing", () => {
  it("keeps short text blocks compact", () => {
    expect(getTextBlockHeight(20)).toBe(40);
    expect(isTextBlockScrollable(20)).toBe(false);
  });

  it("caps tall text blocks and enables scrolling", () => {
    expect(getTextBlockHeight(480)).toBe(320);
    expect(isTextBlockScrollable(480)).toBe(true);
  });

  it("sizes code blocks by visible line count within bounds", () => {
    expect(getCodeBlockMinHeight()).toBe("86px");
    expect(getCodeBlockMaxHeight()).toBe("328px");
    expect(getCodeBlockHeight("const x = 1;")).toBe("86px");
    expect(
      getCodeBlockHeight("1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16"),
    ).toBe("328px");
  });
});
