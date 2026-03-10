import type { LessonContent } from "@/content/lessons/types";

export const lesson0001WelcomeToShipBySundayLessonContent: LessonContent = {
  "lessonId": "0.1",
  "slug": "00-01-welcome-to-ship-by-sunday",
  "status": "draft",
  "intro": "Reset the student's behavior. They need to feel guided, slightly challenged, and clear on what this weekend is actually for.",
  "lessonMeta": {
    "runtimeLabel": "4-6 min",
    "goal": "Set the contract: this is for completion, not consumption.",
    "purpose": "Reset the student's behavior. They need to feel guided, slightly challenged, and clear on what this weekend is actually for."
  },
  "actionCard": {
    "jobNow": "Create a sprint folder and duplicate the provided templates / worksheets.",
    "timebox": "10 minutes",
    "comeBackWith": "A ready workspace with all four worksheets open."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Welcome to Ship by Sunday"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "Welcome to Ship by Sunday. This is not designed to be watched. It is designed to be completed. I am going to show you what matters, then I am going to tell you to pause and go do the rep."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not over-credential yourself here. Keep it crisp. Do not explain every block in depth yet; just orient them."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Good. Now you know the rules. Next, I will show you the full path so nothing feels mysterious."
      }
    ],
    "resources": [
      {
        "id": "student-packet",
        "label": "Student Packet",
        "href": "/downloads/ship-by-sunday-student-packet.pdf",
        "kind": "download"
      },
      {
        "id": "worksheet-packet",
        "label": "Worksheet Packet",
        "href": "/downloads/ship-by-sunday-worksheets.pdf",
        "kind": "download"
      }
    ]
  },
  "workbench": {
    "prompt": "Welcome to Ship by Sunday. This is not designed to be watched. It is designed to be completed.",
    "teachingPoints": [
      "What this sprint is: structured, on-demand, one focused weekend.",
      "What this sprint is not: a binge course, a bootcamp, a passive masterclass.",
      "What they leave with: brief, spec, build, live URL.",
      "The rule: do not skip ahead, do not hoard theory, do not wait to feel ready."
    ],
    "emptyState": "Welcome to Ship by Sunday. This is not designed to be watched. It is designed to be completed."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
