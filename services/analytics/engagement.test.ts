import { describe, expect, it } from "vitest";

describe("engagement analytics helpers", () => {
  function percentage(numerator: number, denominator: number): number {
    if (denominator <= 0) {
      return 0;
    }

    return Math.round((numerator / denominator) * 1000) / 10;
  }

  it("calculates percentages with one decimal place", () => {
    expect(percentage(1, 4)).toBe(25);
    expect(percentage(1, 3)).toBe(33.3);
  });

  it("returns zero when denominator is zero", () => {
    expect(percentage(5, 0)).toBe(0);
  });
});
