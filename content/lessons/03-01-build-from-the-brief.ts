import type { LessonContent } from "@/content/lessons/types";

export const lesson0301BuildFromTheBriefLessonContent: LessonContent = {
  "lessonId": "3.1",
  "slug": "03-01-build-from-the-brief",
  "status": "draft",
  "intro": "The model is only as useful as the instructions it gets.",
  "lessonMeta": {
    "runtimeLabel": "5-7 min",
    "goal": "Teach them to prompt from clarity, not vibes.",
    "purpose": "The model is only as useful as the instructions it gets."
  },
  "actionCard": {
    "jobNow": "Copy your product brief and design spec into the agent brief template.",
    "timebox": "10 minutes",
    "comeBackWith": "A completed agent brief."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Build From the Brief"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "Do not prompt from vibes. Prompt from clarity. Most AI builds fail before the code starts because the product is still foggy."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not ask the model to be creative where accuracy matters. Do not overcomplicate the prompt structure."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Nice. Now let us get the environment ready so you can actually run the thing."
      }
    ],
    "resources": [
      {
        "id": "worksheet-03",
        "label": "Worksheet 03 — Build Plan + Agent Brief",
        "href": "/downloads/ship-by-sunday-worksheets.pdf",
        "kind": "download"
      }
    ]
  },
  "workbench": {
    "prompt": "Do not prompt from vibes. Prompt from clarity.",
    "teachingPoints": [
      "Show the difference between a weak prompt and a strong brief-based prompt.",
      "Explain what the agent needs: product, user, flow, scope, definition of done."
    ],
    "emptyState": "Do not prompt from vibes. Prompt from clarity."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
