import type { LessonContent } from "@/content/lessons/types";

export const lesson0203StoryboardTheJourneyLessonContent: LessonContent = {
  "lessonId": "2.3",
  "slug": "02-03-storyboard-the-journey",
  "status": "draft",
  "intro": "This helps them think in scenes rather than isolated screens.",
  "lessonMeta": {
    "runtimeLabel": "6-8 min",
    "goal": "Turn sketches into an ordered experience.",
    "purpose": "This helps them think in scenes rather than isolated screens."
  },
  "actionCard": {
    "jobNow": "Lay out the user journey screen by screen.",
    "timebox": "15 minutes",
    "comeBackWith": "A storyboard of the experience."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Storyboard the Journey"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "A good storyboard reduces confusion before code starts. Products are journeys, not just pages."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not explode into every edge case. Keep the spine of the product visible."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Now that the flow is clear, let us get just enough Figma under your fingers to move quickly."
      }
    ],
    "resources": [
      {
        "id": "worksheet-02",
        "label": "Worksheet 02 — Build-Ready Design Spec",
        "href": "/downloads/ship-by-sunday-worksheets.pdf",
        "kind": "download"
      }
    ]
  },
  "workbench": {
    "prompt": "A good storyboard reduces confusion before code starts.",
    "teachingPoints": [
      "Start with where the user first encounters the product.",
      "Move through the key task.",
      "End on the outcome or completion moment."
    ],
    "emptyState": "A good storyboard reduces confusion before code starts.",
    "templateDownloadLabel": "Open Worksheet 02 storyboard template",
    "templateDownloadHref": "/downloads/ship-by-sunday-worksheets.pdf"
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
