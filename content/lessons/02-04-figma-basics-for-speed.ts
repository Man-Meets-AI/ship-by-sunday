import type { LessonContent } from "@/content/lessons/types";

export const lesson0204FigmaBasicsForSpeedLessonContent: LessonContent = {
  "lessonId": "2.4",
  "slug": "02-04-figma-basics-for-speed",
  "status": "draft",
  "intro": "Teach only the basics required to survive the sprint.",
  "lessonMeta": {
    "runtimeLabel": "8-10 min",
    "goal": "Remove friction around the tool itself.",
    "purpose": "Teach only the basics required to survive the sprint."
  },
  "actionCard": {
    "jobNow": "Open the provided Figma file and practice the core hotkeys until they feel less weird.",
    "timebox": "5 minutes",
    "comeBackWith": "Basic comfort moving around the file."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Figma Basics for Speed"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "key-line",
        "title": "Key line",
        "body": "This is not Figma school. This is enough Figma to keep the sprint moving. Fluency matters because awkward tools slow decisions."
      },
      {
        "id": "avoid-this",
        "title": "Avoid this",
        "body": "Do not show the whole Figma universe. Do not drift into auto-layout philosophy unless it directly helps this sprint."
      },
      {
        "id": "lock-it-in",
        "title": "Lock it in",
        "body": "Good. Now use the tool to translate the sketches into rough screens."
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
    "prompt": "This is not Figma school. This is enough Figma to keep the sprint moving.",
    "teachingPoints": [
      "Show frames, move, duplicate, resize, align, and basic layout behavior.",
      "Demonstrate the hotkeys you actually want them to practice.",
      "Keep the file simple and repeatable."
    ],
    "emptyState": "This is not Figma school. This is enough Figma to keep the sprint moving."
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
