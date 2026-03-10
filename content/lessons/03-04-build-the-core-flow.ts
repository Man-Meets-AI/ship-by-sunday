import type { LessonContent } from "@/content/lessons/types";

export const lesson0304BuildTheCoreFlowLessonContent: LessonContent = {
  "lessonId": "3.4",
  "slug": "03-04-build-the-core-flow",
  "status": "draft",
  "intro": "This is the heart of the block.",
  "lessonMeta": {
    "runtimeLabel": "12-15 min",
    "goal": "Implement the main path before edge cases.",
    "purpose": "This is the heart of the block."
  },
  "actionCard": {
    "jobNow": "Implement the main user flow end to end.",
    "timebox": "30-45 minutes",
    "comeBackWith": "The core product flow working locally."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Build the Core Flow"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "Build the spine first. One screen at a time. One user path at a time."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not chase every edge case. Do not drift into architecture theory."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Good. Now let us stop bugs from eating the whole weekend."
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
    "prompt": "Build the spine first.",
    "teachingPoints": [
      "Implement the main user path end to end.",
      "Check handoff between screens.",
      "Keep the success state visible."
    ],
    "emptyState": "Build the spine first."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
