const FREE_PLAN_NOTE_LIMIT = 25;

export function getFreePlanNoteLimit() {
  return FREE_PLAN_NOTE_LIMIT;
}

export function normalizeNoteInput(args: { title: string; body: string }) {
  const title = args.title.trim();
  const body = args.body.trim();

  if (!title) {
    throw new Error("A note title is required.");
  }

  if (!body) {
    throw new Error("A note body is required.");
  }

  return { title, body };
}

export function assertNoteCreationAllowed(args: {
  existingNoteCount: number;
  hasUnlimitedNotes: boolean;
}) {
  if (!args.hasUnlimitedNotes && args.existingNoteCount >= FREE_PLAN_NOTE_LIMIT) {
    throw new Error(
      `Free workspaces are limited to ${FREE_PLAN_NOTE_LIMIT} notes.`,
    );
  }
}
