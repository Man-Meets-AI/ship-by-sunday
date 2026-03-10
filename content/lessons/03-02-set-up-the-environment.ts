import type { LessonContent } from "@/content/lessons/types";

export const lesson0302SetUpTheEnvironmentLessonContent: LessonContent = {
  "lessonId": "3.2",
  "slug": "03-02-set-up-the-environment",
  "status": "draft",
  "intro": "Students need one path, one repo, one local success state.",
  "lessonMeta": {
    "runtimeLabel": "8-10 min",
    "goal": "Get the starter project running without wandering.",
    "purpose": "Students need one path, one repo, one local success state."
  },
  "actionCard": {
    "jobNow": "Open the starter project and get it running locally in your browser.",
    "timebox": "15 minutes",
    "comeBackWith": "A working local environment."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Set Up the Environment"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "Pick one path and move. The goal is to see the app running locally, not to become an infrastructure engineer."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not compare five editors or three deployment providers. Avoid rabbit holes on version control unless absolutely necessary."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Good. Now you have a running shell. Next, brief the agent the right way."
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
    "prompt": "Pick one path and move.",
    "teachingPoints": [
      "Open the starter repo.",
      "Run the commands.",
      "Show the browser running the local app.",
      "Point to the minimum folders that matter."
    ],
    "emptyState": "Pick one path and move."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
