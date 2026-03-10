import type { LessonContent } from "@/content/lessons/types";

export const lesson0101StartWithTheProblemLessonContent: LessonContent = {
  "lessonId": "1.1",
  "slug": "01-01-start-with-the-problem",
  "status": "draft",
  "intro": "Strong apps start with an annoying, expensive, or emotionally charged problem. Novelty is weaker than pain.",
  "lessonMeta": {
    "runtimeLabel": "6-8 min",
    "goal": "Get them out of feature-land and into pain-land.",
    "purpose": "Strong apps start with an annoying, expensive, or emotionally charged problem. Novelty is weaker than pain."
  },
  "actionCard": {
    "jobNow": "Write down 3 annoying problems from your life or work that would actually be worth solving.",
    "timebox": "10 minutes",
    "comeBackWith": "Three candidate problems."
  },
  "coach": {
    "video": {
      "status": "pending",
      "title": "Start With the Problem"
    },
    "transcript": {
      "status": "empty"
    },
    "examples": [
      {
        "id": "weak-vs-strong-problem",
        "title": "Weak vs stronger problem",
        "body": "Weak: 'I want to build an AI meeting app.' Stronger: 'After team meetings, early-stage startup operators lose action items, forget decisions, and waste time turning messy notes into clear follow-up tasks.'"
      },
      {
        "id": "candidate-problems",
        "title": "Three candidate problems",
        "body": "1. Startup operators lose action items after meetings. 2. Freelancers forget client follow-ups because notes are scattered. 3. Small teams lose recurring process tasks because nobody owns the checklist after the meeting ends."
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
    "prompt": "Do not start with \"I want to build an AI app.\" Start with \"someone has this painful problem.\"",
    "teachingPoints": [
      "Contrast weak starts with stronger problem statements.",
      "Explain why personal pain is often the best starting point.",
      "Give 2-3 examples from your own life or products."
    ],
    "emptyState": "Do not start with \"I want to build an AI app.\" Start with \"someone has this painful problem.\""
  },
  "sourceRefs": [
    "assets/ship_by_sunday_recording_blueprint_v3.md",
    "assets/ship_by_sunday_wireframes_v_1 (1).md"
  ]
};
