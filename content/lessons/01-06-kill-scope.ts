import type { LessonContent } from "@/content/lessons/types";

export const lesson0106KillScopeLessonContent: LessonContent = {
  "lessonId": "1.6",
  "slug": "01-06-kill-scope",
  "status": "draft",
  "intro": "The key behavior here is subtraction.",
  "lessonMeta": {
    "runtimeLabel": "6-8 min",
    "goal": "Prevent weekend death by feature creep.",
    "purpose": "The key behavior here is subtraction."
  },
  "actionCard": {
    "jobNow": "Fill out the MVP section and cut at least 3 things.",
    "timebox": "10 minutes",
    "comeBackWith": "A tighter MVP scope."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Kill Scope"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "oversized-vs-v1",
        "title": "Oversized idea vs weekend v1",
        "body": "Oversized: meeting platform with uploads, transcription, workspaces, search, Slack, calendar sync, speaker recognition, follow-up emails, and analytics. V1: paste notes, generate summary, review, copy or share."
      },
      {
        "id": "sunday-test",
        "title": "Sunday Test",
        "body": "Ask: 'What has to work by Sunday for the promise to still be true?' For the example app: a user can paste notes, get a usable summary, and share it."
      }
    ],
    "resources": [
      {
        "id": "worksheet-01",
        "label": "Worksheet 01 — One-Page Product Brief",
        "href": "/downloads/ship-by-sunday-worksheets.pdf",
        "kind": "download"
      }
    ]
  },
  "workbench": {
    "prompt": "A smaller shipped app beats a larger imaginary one.",
    "teachingPoints": [
      "Split features into: must-have, nice-to-have, definitely-not-now.",
      "Define what good enough for Sunday means.",
      "Cut at least three things live."
    ],
    "emptyState": "A smaller shipped app beats a larger imaginary one."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
