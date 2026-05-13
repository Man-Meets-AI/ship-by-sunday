import { describe, expect, it } from "vitest";

import {
  assertNoteCreationAllowed,
  getFreePlanNoteLimit,
  normalizeNoteInput,
} from "@/lib/notes/rules";

describe("note rules", () => {
  it("normalizes title and body before persistence", () => {
    expect(
      normalizeNoteInput({
        title: "  Release checklist  ",
        body: "  Confirm webhook replay handling  ",
      }),
    ).toEqual({
      title: "Release checklist",
      body: "Confirm webhook replay handling",
    });
  });

  it("rejects empty content after trimming", () => {
    expect(() =>
      normalizeNoteInput({
        title: "   ",
        body: "valid",
      }),
    ).toThrow(/title is required/i);

    expect(() =>
      normalizeNoteInput({
        title: "valid",
        body: "   ",
      }),
    ).toThrow(/body is required/i);
  });

  it("enforces the free plan note limit", () => {
    expect(() =>
      assertNoteCreationAllowed({
        existingNoteCount: getFreePlanNoteLimit(),
        hasUnlimitedNotes: false,
      }),
    ).toThrow(/limited to 25 notes/i);
  });

  it("allows note creation when the entitlement is enabled", () => {
    expect(() =>
      assertNoteCreationAllowed({
        existingNoteCount: getFreePlanNoteLimit(),
        hasUnlimitedNotes: true,
      }),
    ).not.toThrow();
  });
});
