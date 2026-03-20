import { routeConfig } from "@/config/product";
import type {
  BlockConfig,
  BlockId,
  CurriculumManifest,
  LessonConfig,
  LessonKey,
  LessonLayoutMode,
} from "./contracts";
import { buildLessons } from "./lessons/build";
import { ceoLessons } from "./lessons/ceo";
import { designLessons } from "./lessons/design";
import { shipLessons } from "./lessons/ship";
import { startHereLessons } from "./lessons/start-here";
import { attachGeneratedLessonMedia } from "./video";

const sourceLessons = [
  ...startHereLessons.filter((lesson) => lesson.id !== "1.0"),
  ...ceoLessons,
  ...designLessons,
  ...buildLessons,
  ...shipLessons,
];

const sourceLessonsById = new Map(sourceLessons.map((lesson) => [lesson.id, lesson]));

const CURRICULUM_JSON = String.raw`{
  "version": 2,
  "blocks": [
    {
      "id": "CEO",
      "label": "CEO",
      "level": 1,
      "summary": "Choose the problem, user, outcome, and scope before you build.",
      "order": 1,
      "startsLocked": false
    },
    {
      "id": "DESIGN",
      "label": "DESIGN",
      "level": 2,
      "summary": "Turn the idea into a buildable first version.",
      "order": 2,
      "startsLocked": true
    },
    {
      "id": "BUILD",
      "label": "BUILD",
      "level": 3,
      "summary": "Make the core flow work locally without spiraling.",
      "order": 3,
      "startsLocked": true
    },
    {
      "id": "SHIP",
      "label": "SHIP",
      "level": 4,
      "summary": "Get the app live, send it, and capture real feedback.",
      "order": 4,
      "startsLocked": true
    }
  ],
  "lessons": [
    {
      "sourceId": "1.1",
      "lessonKey": "welcome-to-ship-by-sunday",
      "displayLabel": "1.1",
      "routeSegment": "welcome-to-ship-by-sunday",
      "blockId": "CEO",
      "videoAssetId": "0.1"
    },
    {
      "sourceId": "1.2",
      "lessonKey": "how-the-sprint-works",
      "displayLabel": "1.2",
      "routeSegment": "how-the-sprint-works",
      "blockId": "CEO",
      "videoAssetId": "0.2"
    },
    {
      "sourceId": "1.3",
      "lessonKey": "start-with-the-problem",
      "displayLabel": "1.3",
      "routeSegment": "start-with-the-problem",
      "blockId": "CEO",
      "videoAssetId": "1.2"
    },
    {
      "sourceId": "1.4",
      "lessonKey": "pick-one-user",
      "displayLabel": "1.4",
      "routeSegment": "pick-one-user",
      "blockId": "CEO",
      "videoAssetId": "1.3"
    },
    {
      "sourceId": "1.5",
      "lessonKey": "define-the-outcome",
      "displayLabel": "1.5",
      "routeSegment": "define-the-outcome",
      "blockId": "CEO",
      "videoAssetId": "1.3"
    },
    {
      "sourceId": "1.6",
      "lessonKey": "light-research-not-a-thesis",
      "displayLabel": "1.6",
      "routeSegment": "light-research-not-a-thesis",
      "blockId": "CEO",
      "videoAssetId": "1.4"
    },
    {
      "sourceId": "1.8",
      "lessonKey": "ceo-wrap-up",
      "displayLabel": "1.8",
      "routeSegment": "ceo-wrap-up",
      "blockId": "CEO",
      "videoAssetId": "1.6"
    },
    {
      "sourceId": "1.9",
      "lessonKey": "ceo-skills",
      "displayLabel": "1.9",
      "routeSegment": "ceo-skills",
      "blockId": "CEO",
      "videoAssetId": "1.7"
    },
    {
      "sourceId": "2.0",
      "lessonKey": "design-references",
      "displayLabel": "2.0",
      "routeSegment": "design-references",
      "blockId": "DESIGN",
      "videoAssetId": "2.0"
    },
    {
      "sourceId": "2.1",
      "lessonKey": "map-the-core-flow",
      "displayLabel": "2.1",
      "routeSegment": "map-the-core-flow",
      "blockId": "DESIGN",
      "videoAssetId": "2.1"
    },
    {
      "sourceId": "2.2",
      "lessonKey": "find-references-first",
      "displayLabel": "2.2",
      "routeSegment": "find-references-first",
      "blockId": "DESIGN",
      "videoAssetId": "2.2"
    },
    {
      "sourceId": "3.0",
      "lessonKey": "build-kickoff",
      "displayLabel": "3.0",
      "routeSegment": "build-kickoff",
      "blockId": "BUILD",
      "videoAssetId": "3.0"
    },
    {
      "sourceId": "3.1",
      "lessonKey": "iterate-the-product-with-ai",
      "displayLabel": "3.1",
      "routeSegment": "iterate-the-product-with-ai",
      "blockId": "BUILD",
      "videoAssetId": "3.1"
    },
    {
      "sourceId": "3.2",
      "lessonKey": "map-the-repo-and-starter",
      "displayLabel": "3.2",
      "routeSegment": "map-the-repo-and-starter",
      "blockId": "BUILD",
      "videoAssetId": "3.2"
    },
    {
      "sourceId": "3.3",
      "lessonKey": "provider-setup",
      "displayLabel": "3.3",
      "routeSegment": "provider-setup",
      "blockId": "BUILD",
      "videoAssetId": "3.3"
    },
    {
      "sourceId": "3.4",
      "lessonKey": "wire-db-auth-and-payments",
      "displayLabel": "3.4",
      "routeSegment": "wire-db-auth-and-payments",
      "blockId": "BUILD",
      "videoAssetId": "3.4"
    },
    {
      "sourceId": "3.5",
      "lessonKey": "codex-marketing-site",
      "displayLabel": "3.5",
      "routeSegment": "codex-marketing-site",
      "blockId": "BUILD",
      "videoAssetId": "3.5"
    },
    {
      "sourceId": "3.6",
      "lessonKey": "switch-to-sandbox-and-boot-local",
      "displayLabel": "3.6",
      "routeSegment": "switch-to-sandbox-and-boot-local",
      "blockId": "BUILD",
      "videoAssetId": "3.6"
    },
    {
      "sourceId": "3.7",
      "lessonKey": "read-and-execute-ai-plans",
      "displayLabel": "3.7",
      "routeSegment": "read-and-execute-ai-plans",
      "blockId": "BUILD",
      "videoAssetId": "3.7"
    },
    {
      "sourceId": "3.8",
      "lessonKey": "build-setting-up-slices",
      "displayLabel": "3.8",
      "routeSegment": "build-setting-up-slices",
      "blockId": "BUILD",
      "videoAssetId": "3.8"
    },
    {
      "sourceId": "3.9",
      "lessonKey": "implement-the-first-slice",
      "displayLabel": "3.9",
      "routeSegment": "implement-the-first-slice",
      "blockId": "BUILD",
      "videoAssetId": "3.9"
    },
    {
      "sourceId": "3.10",
      "lessonKey": "build-core-ux-plan-flow",
      "displayLabel": "3.10",
      "routeSegment": "build-core-ux-plan-flow",
      "blockId": "BUILD",
      "videoAssetId": "3.10"
    },
    {
      "sourceId": "3.11",
      "lessonKey": "core-ux-build",
      "displayLabel": "3.11",
      "routeSegment": "core-ux-build",
      "blockId": "BUILD",
      "videoAssetId": "3.11"
    },
    {
      "sourceId": "3.12",
      "lessonKey": "core-ux-build-3",
      "displayLabel": "3.12",
      "routeSegment": "core-ux-build-3",
      "blockId": "BUILD",
      "videoAssetId": "3.12"
    },
    {
      "sourceId": "3.13",
      "lessonKey": "debug-and-stabilize-without-spiraling",
      "displayLabel": "3.13",
      "routeSegment": "debug-and-stabilize-without-spiraling",
      "blockId": "BUILD",
      "videoAssetId": "3.13"
    },
    {
      "sourceId": "3.14",
      "lessonKey": "wrapping",
      "displayLabel": "3.14",
      "routeSegment": "wrapping",
      "blockId": "BUILD",
      "videoAssetId": "3.14"
    },
    {
      "sourceId": "3.15",
      "lessonKey": "create-production-instance",
      "displayLabel": "3.15",
      "routeSegment": "create-production-instance",
      "blockId": "BUILD",
      "videoAssetId": "3.15"
    },
    {
      "sourceId": "3.16",
      "lessonKey": "finalize-build-handoff-and-unlock-ship",
      "displayLabel": "3.16",
      "routeSegment": "finalize-build-handoff-and-unlock-ship",
      "blockId": "BUILD",
      "videoAssetId": "3.16"
    },
    {
      "sourceId": "4.0",
      "lessonKey": "product-review",
      "displayLabel": "4.0",
      "routeSegment": "product-review",
      "blockId": "SHIP",
      "videoAssetId": "4.0"
    }
  ],
  "legacyRouteAliases": {
    "1.7": "map-the-core-flow",
    "2.3": "build-kickoff",
    "2.4": "build-kickoff",
    "2.5": "build-kickoff",
    "2.6": "build-kickoff",
    "2.7": "build-kickoff",
    "4.1": "product-review",
    "4.2": "product-review",
    "4.3": "product-review",
    "4.4": "product-review",
    "4.5": "product-review",
    "4.6": "product-review"
  }
}`;

function defineCurriculum(manifest: CurriculumManifest) {
  const blockIds = new Set(manifest.blocks.map((block) => block.id));
  const lessonKeys = new Set<LessonKey>();
  const displayLabels = new Set<string>();
  const routeSegments = new Set<string>();

  for (const lesson of manifest.lessons) {
    if (!blockIds.has(lesson.blockId)) {
      throw new Error(`Unknown block ${lesson.blockId} for lesson ${lesson.lessonKey}.`);
    }
    if (lessonKeys.has(lesson.lessonKey)) {
      throw new Error(`Duplicate lessonKey ${lesson.lessonKey}.`);
    }
    if (displayLabels.has(lesson.displayLabel)) {
      throw new Error(`Duplicate displayLabel ${lesson.displayLabel}.`);
    }
    if (routeSegments.has(lesson.routeSegment)) {
      throw new Error(`Duplicate routeSegment ${lesson.routeSegment}.`);
    }

    lessonKeys.add(lesson.lessonKey);
    displayLabels.add(lesson.displayLabel);
    routeSegments.add(lesson.routeSegment);
  }

  return manifest;
}

export const curriculumManifest = defineCurriculum(
  JSON.parse(CURRICULUM_JSON) as CurriculumManifest,
);

export const CURRICULUM_VERSION = curriculumManifest.version;

export const blocks: BlockConfig[] = [...curriculumManifest.blocks];

const blockOrderIndex = new Map(
  curriculumManifest.blocks.map((block) => [block.id, block.order]),
);

function buildUnlockTargets(
  lesson: LessonConfig,
  nextLesson: LessonConfig | undefined,
) {
  if (!nextLesson) {
    return undefined;
  }

  return {
    lessons: [nextLesson.displayLabel],
    ...(lesson.block !== nextLesson.block ? { blocks: [nextLesson.block] } : {}),
  };
}

const orderedLessonDefinitions = [...curriculumManifest.lessons].sort((left, right) => {
  const blockDifference =
    (blockOrderIndex.get(left.blockId) ?? 0) - (blockOrderIndex.get(right.blockId) ?? 0);
  if (blockDifference !== 0) {
    return blockDifference;
  }

  return curriculumManifest.lessons.indexOf(left) - curriculumManifest.lessons.indexOf(right);
});

const lessonRegistryBase = orderedLessonDefinitions.map((definition, index) => {
  const sourceLesson = sourceLessonsById.get(definition.sourceId);
  if (!sourceLesson) {
    throw new Error(`Unknown source lesson ${definition.sourceId}.`);
  }

  return {
    ...sourceLesson,
    id: definition.displayLabel,
    lessonKey: definition.lessonKey,
    displayLabel: definition.displayLabel,
    routeSegment: definition.routeSegment,
    videoAssetId: definition.videoAssetId ?? null,
    block: definition.blockId,
    order: index + 1,
  } satisfies LessonConfig;
});

export const lessonRegistry: LessonConfig[] = lessonRegistryBase
  .map((lesson, index, lessons) => {
    const previousLesson = lessons[index - 1];
    const nextLesson = lessons[index + 1];

    const lessonWithNeighbors = {
      ...lesson,
      prevLessonId: previousLesson?.displayLabel,
      nextLessonId: nextLesson?.displayLabel,
      prevLessonKey: previousLesson?.lessonKey,
      nextLessonKey: nextLesson?.lessonKey,
    } satisfies LessonConfig;

    return {
      ...lessonWithNeighbors,
      unlocks: buildUnlockTargets(lessonWithNeighbors, nextLesson),
    } satisfies LessonConfig;
  })
  .map(attachGeneratedLessonMedia);

export const lessonIndex = Object.fromEntries(
  lessonRegistry.map((lesson) => [lesson.id, lesson]),
) as Record<string, LessonConfig>;

export const lessonKeyIndex = Object.fromEntries(
  lessonRegistry.map((lesson) => [lesson.lessonKey, lesson]),
) as Record<string, LessonConfig>;

export const lessonRouteIndex = Object.fromEntries(
  lessonRegistry.map((lesson) => [lesson.routeSegment, lesson]),
) as Record<string, LessonConfig>;

export const legacyRouteAliases = {
  "1.0": routeConfig.mission,
  ...Object.fromEntries(
    Object.entries(curriculumManifest.legacyRouteAliases ?? {}).map(([legacyId, routeSegment]) => [
      legacyId,
      `/lesson/${routeSegment}`,
    ]),
  ),
} as Record<string, string>;

export function getLessonById(displayLabel: string): LessonConfig | null {
  return lessonIndex[displayLabel] ?? null;
}

export function getLessonByKey(lessonKey: LessonKey): LessonConfig | null {
  return lessonKeyIndex[lessonKey] ?? null;
}

export function getLessonByRouteSegment(routeSegment: string): LessonConfig | null {
  return lessonRouteIndex[routeSegment] ?? null;
}

export function getLesson(identifier: string): LessonConfig | undefined {
  return (
    getLessonByKey(identifier) ??
    getLessonByRouteSegment(identifier) ??
    getLessonById(identifier) ??
    undefined
  );
}

export function getLessonDisplayLabel(identifier: string): string | null {
  return getLesson(identifier)?.displayLabel ?? null;
}

export function getLessonHref(identifier: string): string {
  if (identifier === "1.0" || identifier === routeConfig.mission) {
    return routeConfig.mission;
  }

  const lesson = getLesson(identifier);
  return lesson ? `/lesson/${lesson.routeSegment}` : `/lesson/${identifier}`;
}

export function getPreviousLesson(identifier: string): LessonConfig | null {
  const lesson = getLesson(identifier);
  return lesson?.prevLessonKey ? getLessonByKey(lesson.prevLessonKey) : null;
}

export function getNextLesson(identifier: string): LessonConfig | null {
  const lesson = getLesson(identifier);
  return lesson?.nextLessonKey ? getLessonByKey(lesson.nextLessonKey) : null;
}

export function getBlockLessons(blockId: BlockId) {
  return lessonRegistry.filter((lesson) => lesson.block === blockId);
}

const DEFAULT_LESSON_LAYOUT_MODES = [
  "split",
  "focus",
] as const satisfies readonly LessonLayoutMode[];
const WATCH_LESSON_LAYOUT_MODES = [
  "focus",
] as const satisfies readonly LessonLayoutMode[];

export function getAvailableLayoutModesForLesson(
  lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
): LessonLayoutMode[] {
  if (lesson.shell === "watch" && !lesson.availableLayoutModes?.length) {
    return [...WATCH_LESSON_LAYOUT_MODES];
  }

  return lesson.availableLayoutModes?.length
    ? [...lesson.availableLayoutModes]
    : [...DEFAULT_LESSON_LAYOUT_MODES];
}

export function getDefaultLayoutModeForLesson(
  lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
): LessonLayoutMode {
  const availableLayoutModes = getAvailableLayoutModesForLesson(lesson);
  const preferredLayoutMode =
    lesson.shell === "focus" || lesson.shell === "watch" ? "focus" : "split";

  return availableLayoutModes.includes(preferredLayoutMode)
    ? preferredLayoutMode
    : (availableLayoutModes[0] ?? "split");
}

export function normalizeLayoutModeForLesson(
  lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
  layoutMode: unknown,
): LessonLayoutMode {
  if (layoutMode === "split" || layoutMode === "focus") {
    return getAvailableLayoutModesForLesson(lesson).includes(layoutMode)
      ? layoutMode
      : getDefaultLayoutModeForLesson(lesson);
  }

  return getDefaultLayoutModeForLesson(lesson);
}

export function lessonSupportsLayoutToggle(
  lesson: Pick<LessonConfig, "availableLayoutModes" | "shell">,
): boolean {
  return getAvailableLayoutModesForLesson(lesson).length > 1;
}
