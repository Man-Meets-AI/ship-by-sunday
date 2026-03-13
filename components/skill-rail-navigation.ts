import { getLessonHref } from "@/lib/course/manifest";

export type SkillRailLesson = {
	id: string;
	shortTitle: string;
	status: "available" | "completed" | "in_progress" | "locked";
};

export type SkillRailNavigationTarget = {
	id: string;
	shortTitle: string;
	status: Exclude<SkillRailLesson["status"], "locked">;
	href: string;
	index: number;
};

type SkillRailShortcutEvent = {
	key: string;
	altKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
	shiftKey?: boolean;
	defaultPrevented?: boolean;
	repeat?: boolean;
	target: EventTarget | null;
};

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);
const INTERACTIVE_TAGS = new Set(["A", "AUDIO", "BUTTON", "SUMMARY", "VIDEO"]);
const INTERACTIVE_ROLES = new Set([
	"button",
	"checkbox",
	"link",
	"menuitem",
	"option",
	"radio",
	"slider",
	"switch",
	"tab",
]);

type ShortcutTargetCandidate = {
	tagName?: string;
	isContentEditable?: boolean;
	getAttribute?: (name: string) => string | null;
};

function toShortcutTargetCandidate(
	target: EventTarget | null,
): ShortcutTargetCandidate | null {
	if (!target || typeof target !== "object") {
		return null;
	}

	return target as ShortcutTargetCandidate;
}

function isNavigableLesson(
	lesson: SkillRailLesson | undefined,
): lesson is SkillRailLesson & {
	status: Exclude<SkillRailLesson["status"], "locked">;
} {
	if (!lesson || lesson.status === "locked") {
		return false;
	}

	return true;
}

function toNavigationTarget(
	lesson: SkillRailLesson | undefined,
	index: number,
): SkillRailNavigationTarget | null {
	if (!isNavigableLesson(lesson)) {
		return null;
	}

	return {
		...lesson,
		href: getLessonHref(lesson.id),
		index,
	};
}

export function getSkillRailNavigation(
	navigationLessons: SkillRailLesson[],
	currentLessonId?: string,
) {
	const currentIndex = currentLessonId
		? navigationLessons.findIndex((lesson) => lesson.id === currentLessonId)
		: -1;
	const previousLesson =
		currentIndex > 0 ? navigationLessons[currentIndex - 1] : undefined;
	const nextLesson =
		currentIndex >= 0 && currentIndex < navigationLessons.length - 1
			? navigationLessons[currentIndex + 1]
			: undefined;

	return {
		currentIndex,
		previousTarget: toNavigationTarget(previousLesson, currentIndex - 1),
		nextTarget: toNavigationTarget(nextLesson, currentIndex + 1),
	};
}

export function getSkillRailShortcutDirection(key: string) {
	const normalizedKey = key.toLowerCase();

	if (normalizedKey === "arrowleft" || normalizedKey === "left") {
		return "previous" as const;
	}

	if (normalizedKey === "arrowright" || normalizedKey === "right") {
		return "next" as const;
	}

	if (normalizedKey === "q") {
		return "previous" as const;
	}

	if (normalizedKey === "e") {
		return "next" as const;
	}

	return null;
}

export function isEditableShortcutTarget(target: EventTarget | null) {
	const candidate = toShortcutTargetCandidate(target);
	if (!candidate) {
		return false;
	}

	if (
		typeof candidate.tagName === "string" &&
		EDITABLE_TAGS.has(candidate.tagName.toUpperCase())
	) {
		return true;
	}

	if (candidate.isContentEditable === true) {
		return true;
	}

	const contentEditableValue = candidate.getAttribute?.("contenteditable");
	return (
		typeof contentEditableValue === "string" && contentEditableValue !== "false"
	);
}

export function isInteractiveShortcutTarget(target: EventTarget | null) {
	const candidate = toShortcutTargetCandidate(target);
	if (!candidate) {
		return false;
	}

	if (
		typeof candidate.tagName === "string" &&
		INTERACTIVE_TAGS.has(candidate.tagName.toUpperCase())
	) {
		return true;
	}

	const roleValue = candidate.getAttribute?.("role");
	return typeof roleValue === "string" && INTERACTIVE_ROLES.has(roleValue);
}

export function shouldHandleSkillRailShortcut(event: SkillRailShortcutEvent) {
	if (event.defaultPrevented || event.repeat) {
		return false;
	}

	if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
		return false;
	}

	if (!getSkillRailShortcutDirection(event.key)) {
		return false;
	}

	return (
		!isEditableShortcutTarget(event.target) &&
		!isInteractiveShortcutTarget(event.target)
	);
}
