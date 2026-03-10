import type { LessonContent } from "@/content/lessons/types";

export const lesson0402DeployTheAppLessonContent: LessonContent = {
  "lessonId": "4.2",
  "slug": "04-02-deploy-the-app",
  "status": "draft",
  "intro": "The student needs a public URL, not a deep lesson on infra.",
  "lessonMeta": {
    "runtimeLabel": "8-10 min",
    "goal": "Get the app live fast.",
    "purpose": "The student needs a public URL, not a deep lesson on infra."
  },
  "actionCard": {
    "jobNow": "Deploy the app and get a live link.",
    "timebox": "20 minutes",
    "comeBackWith": "A live URL."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Deploy the App"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "The goal is a URL, not infrastructure mastery. Pick the simplest deployment path and move."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not compare deployment platforms. Keep the energy high once the URL appears."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Nice. The app is live. Now make it easier to understand and easier to share."
      }
    ],
    "resources": [
      {
        "id": "worksheet-04",
        "label": "Worksheet 04 — Launch Plan + Feedback Tracker",
        "href": "/downloads/ship-by-sunday-worksheets.pdf",
        "kind": "download"
      }
    ]
  },
  "workbench": {
    "prompt": "The goal is a URL, not infrastructure mastery.",
    "teachingPoints": [
      "Walk through deployment.",
      "Show environment variables only if truly needed.",
      "Test the live URL and the core flow."
    ],
    "emptyState": "The goal is a URL, not infrastructure mastery."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
