import type { LessonContent } from "@/content/lessons/types";

export const lesson0306BuildBlockWrapUpLessonContent: LessonContent = {
  "lessonId": "3.6",
  "slug": "03-06-build-block-wrap-up",
  "status": "draft",
  "intro": "This is the handoff from local product to public product.",
  "lessonMeta": {
    "runtimeLabel": "3-5 min",
    "goal": "Lock the local milestone and prep for deployment.",
    "purpose": "This is the handoff from local product to public product."
  },
  "actionCard": {
    "jobNow": "Complete Worksheet 03 fully.",
    "timebox": "10 minutes",
    "comeBackWith": "A working local app and a completed agent brief."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Build Block Wrap-Up"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "By now, the app should work locally even if it is still ugly. Ugly and working is enough for the next block."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not start polishing forever. Move them toward deployment."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Nice. The product works on your machine. Next, it needs to leave your machine."
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
    "prompt": "By now, the app should work locally even if it is still ugly.",
    "teachingPoints": [
      "Review the definition of done, blocker fixes, and what still does not matter yet."
    ],
    "emptyState": "By now, the app should work locally even if it is still ugly."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
