import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const blueprintPath = path.join(
	rootDir,
	"assets",
	"ship_by_sunday_recording_blueprint_v3.md",
);
const wireframesPath = path.join(
	rootDir,
	"assets",
	"ship_by_sunday_wireframes_v_1 (1).md",
);
const registryPath = path.join(rootDir, "app", "lessonRegistry.ts");
const contentDir = path.join(rootDir, "content", "lessons");
const sourceDir = path.join(rootDir, "content", "source");
const intermediatePath = path.join(sourceDir, "recording-blueprint.json");
const generatedBarrelPath = path.join(contentDir, "generated.ts");

const worksheetResourcesByBlock = {
	"0": [
		{
			id: "student-packet",
			label: "Student Packet",
			href: "/downloads/ship-by-sunday-student-packet.pdf",
			kind: "download",
		},
		{
			id: "worksheet-packet",
			label: "Worksheet Packet",
			href: "/downloads/ship-by-sunday-worksheets.pdf",
			kind: "download",
		},
	],
	"1": [
		{
			id: "worksheet-01",
			label: "Worksheet 01 — One-Page Product Brief",
			href: "/downloads/ship-by-sunday-worksheets.pdf",
			kind: "download",
		},
	],
	"2": [
		{
			id: "worksheet-02",
			label: "Worksheet 02 — Build-Ready Design Spec",
			href: "/downloads/ship-by-sunday-worksheets.pdf",
			kind: "download",
		},
	],
	"3": [
		{
			id: "worksheet-03",
			label: "Worksheet 03 — Build Plan + Agent Brief",
			href: "/downloads/ship-by-sunday-worksheets.pdf",
			kind: "download",
		},
	],
	"4": [
		{
			id: "worksheet-04",
			label: "Worksheet 04 — Launch Plan + Feedback Tracker",
			href: "/downloads/ship-by-sunday-worksheets.pdf",
			kind: "download",
		},
	],
};

const templateResourceByLessonId = {
	"1.5": {
		label: "Open Worksheet 01 template",
		href: "/downloads/ship-by-sunday-worksheets.pdf",
	},
	"2.2": {
		label: "Open Worksheet 02 template",
		href: "/downloads/ship-by-sunday-worksheets.pdf",
	},
	"2.3": {
		label: "Open Worksheet 02 storyboard template",
		href: "/downloads/ship-by-sunday-worksheets.pdf",
	},
	"4.3": {
		label: "Open Worksheet 04 demo prompt",
		href: "/downloads/ship-by-sunday-worksheets.pdf",
	},
};

const exampleOverridesByLessonId = {
	"1.1": [
		{
			id: "weak-vs-strong-problem",
			title: "Weak vs stronger problem",
			body:
				"Weak: 'I want to build an AI meeting app.' Stronger: 'After team meetings, early-stage startup operators lose action items, forget decisions, and waste time turning messy notes into clear follow-up tasks.'",
		},
		{
			id: "candidate-problems",
			title: "Three candidate problems",
			body:
				"1. Startup operators lose action items after meetings. 2. Freelancers forget client follow-ups because notes are scattered. 3. Small teams lose recurring process tasks because nobody owns the checklist after the meeting ends.",
		},
	],
	"1.2": [
		{
			id: "blurry-vs-tight-user",
			title: "Blurry vs tightened user",
			body:
				"Blurry: 'This app is for teams.' Tightened: 'This app is for early-stage startup operators who run internal team meetings and need a faster way to turn messy notes into clear action items.'",
		},
		{
			id: "user-sentence-stem",
			title: "Sentence stem",
			body:
				"Use: 'This app is for ___ who need ___ without ___.' The goal is one reachable user in one actual moment.",
		},
	],
	"1.3": [
		{
			id: "features-vs-outcome",
			title: "Feature list vs outcome",
			body:
				"Feature-heavy: 'The app uses AI to summarize meetings, organize notes, and generate next steps.' Outcome: 'The app helps startup operators leave a meeting with a clean action summary they can review and send in minutes.'",
		},
		{
			id: "shortest-version",
			title: "Shortest version",
			body:
				"'Turn messy meeting notes into a clear action summary in minutes.' People buy the changed state, not the feature list.",
		},
	],
	"1.4": [
		{
			id: "reference-note-grid",
			title: "Simple research note grid",
			body:
				"Reference 1: clean summary output, weak task ownership, users care about speed and clarity. Reference 2: easy-to-scan action items, too many extra features, users care about sharing fast. Reference 3: familiar note-taking pattern, generic output, users care about trustworthy summaries.",
		},
		{
			id: "research-line",
			title: "Research line",
			body:
				"'You are not writing a market report. You are just trying not to build blind.'",
		},
	],
	"1.5": [
		{
			id: "five-step-flow",
			title: "5-step flow",
			body:
				"1. User pastes meeting notes. 2. App generates a short action summary. 3. User reviews and edits. 4. User copies or shares the summary. 5. Team gets a clean follow-up record.",
		},
		{
			id: "messy-vs-clean-flow",
			title: "Messy flow vs clean flow",
			body:
				"Messy: record meeting, upload file, transcribe, identify speakers, summarize, generate tasks, assign owners, sync calendar, send email, track analytics. Clean: paste notes, generate summary, review, share, done.",
		},
	],
	"1.6": [
		{
			id: "oversized-vs-v1",
			title: "Oversized idea vs weekend v1",
			body:
				"Oversized: meeting platform with uploads, transcription, workspaces, search, Slack, calendar sync, speaker recognition, follow-up emails, and analytics. V1: paste notes, generate summary, review, copy or share.",
		},
		{
			id: "sunday-test",
			title: "Sunday Test",
			body:
				"Ask: 'What has to work by Sunday for the promise to still be true?' For the example app: a user can paste notes, get a usable summary, and share it.",
		},
	],
};

function stripMarkdown(value) {
	return value
		.replace(/\*\*/g, "")
		.replace(/`/g, "")
		.replace(/\\\+/g, "+")
		.replace(/\\-/g, "-")
		.replace(/\s+/g, " ")
		.trim();
}

function slugToConstant(slug) {
	return `lesson${slug
		.split("-")
		.map((part, index) =>
			index === 0
				? part.charAt(0).toUpperCase() + part.slice(1)
				: part.charAt(0).toUpperCase() + part.slice(1),
		)
		.join("")}LessonContent`;
}

function extractBulletLines(sectionBody) {
	return sectionBody
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.map((line) => line.replace(/^\*\*•\*\*\s*/, "").replace(/^•\s*/, ""))
		.map(stripMarkdown)
		.filter(Boolean);
}

function parseLessonSections(lessonBody) {
	const sectionPattern = /^### \*\*(.+?)\*\*\s*$/gm;
	const sections = {};
	const matches = [...lessonBody.matchAll(sectionPattern)];

	for (let index = 0; index < matches.length; index += 1) {
		const current = matches[index];
		const next = matches[index + 1];
		const title = stripMarkdown(current[1]).toLowerCase();
		const start = current.index + current[0].length;
		const end = next ? next.index : lessonBody.length;
		const body = lessonBody.slice(start, end).trim();
		sections[title] = body;
	}

	return sections;
}

function parsePausePrompt(sectionBody) {
	const lines = extractBulletLines(sectionBody);
	const jobNow =
		lines.find((line) => line.toLowerCase().startsWith("your job now:")) ?? "";
	const timebox =
		lines.find((line) => line.toLowerCase().startsWith("timebox:")) ?? "";
	const comeBackWith =
		lines.find((line) => line.toLowerCase().startsWith("come back with:")) ?? "";

	return {
		jobNow: jobNow.replace(/^Your job now:\s*/i, "").trim(),
		timebox: timebox.replace(/^Timebox:\s*/i, "").trim(),
		comeBackWith: comeBackWith.replace(/^Come back with:\s*/i, "").trim(),
	};
}

function parseBlueprint(markdown) {
	const lessonPattern =
		/^## \*\*([0-4]\.\d)\s*\\?-\s*(.+?)\*\*\s*$(?:\r?\n)+([\s\S]*?)(?=^## \*\*[0-4]\.\d\s*\\?-|^# \*\*Appendix|\Z)/gm;
	const lessons = [];

	for (const match of markdown.matchAll(lessonPattern)) {
		const [, lessonId, rawTitle, lessonBody] = match;
		const runtimeLabel =
			lessonBody.match(/\*\*Runtime:\*\*\s*(.+)$/m)?.[1]?.trim() ?? "";
		const goal = stripMarkdown(
			lessonBody.match(/\*\*Goal:\*\*\s*(.+)$/m)?.[1]?.trim() ?? "",
		);
		const purpose = stripMarkdown(
			lessonBody.match(/\*\*Purpose:\*\*\s*(.+)$/m)?.[1]?.trim() ?? "",
		);
		const sections = parseLessonSections(lessonBody);

		lessons.push({
			lessonId,
			title: stripMarkdown(rawTitle),
			runtimeLabel,
			goal,
			purpose,
			suggestedOpeningLines: extractBulletLines(
				sections["suggested opening lines"] ?? "",
			),
			beatsToCover: extractBulletLines(sections["beats to cover"] ?? ""),
			onScreen: extractBulletLines(sections["on screen / screen share"] ?? ""),
			watchouts: extractBulletLines(sections["watchouts"] ?? ""),
			suggestedClose: extractBulletLines(sections["suggested close"] ?? ""),
			pausePrompt: parsePausePrompt(sections["pause prompt"] ?? ""),
		});
	}

	return lessons;
}

function parseWireframes(markdown) {
	const lessonPattern =
		/^## ([0-4]\.\d) .*?\n\*\*Shell:\*\* ([A-Za-z]+)\n\*\*Workbench:\*\* ([a-z_]+)/gm;
	return new Map(
		[...markdown.matchAll(lessonPattern)].map((match) => [
			match[1],
			{ shell: match[2].toLowerCase(), workbench: match[3] },
		]),
	);
}

function parseRegistry(markdown) {
	const lessonPattern =
		/id: "([0-4]\.\d)".*?shell: "([a-z]+)".*?workbench: "([a-z_]+)"/gs;
	return new Map(
		[...markdown.matchAll(lessonPattern)].map((match) => [
			match[1],
			{ shell: match[2], workbench: match[3] },
		]),
	);
}

function validateWireframeLayouts(wireframes, registry) {
	for (const [lessonId, expected] of wireframes.entries()) {
		const actual = registry.get(lessonId);
		if (!actual) {
			throw new Error(`Wireframe lesson ${lessonId} is missing from lessonRegistry.ts`);
		}

		if (expected.shell !== actual.shell || expected.workbench !== actual.workbench) {
			throw new Error(
				`Layout mismatch for ${lessonId}: wireframes expect ${expected.shell}/${expected.workbench}, registry has ${actual.shell}/${actual.workbench}`,
			);
		}
	}
}

function buildSlug(lessonId, title) {
	const [block, step] = lessonId.split(".");
	const normalizedTitle = title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return `${block.padStart(2, "0")}-${step.padStart(2, "0")}-${normalizedTitle}`;
}

function toCoachExamples(blueprintLesson) {
	if (exampleOverridesByLessonId[blueprintLesson.lessonId]) {
		return exampleOverridesByLessonId[blueprintLesson.lessonId];
	}

	const examples = [];
	if (blueprintLesson.suggestedOpeningLines.length > 0) {
		examples.push({
			id: "key-line",
			title: "Key line",
			body: blueprintLesson.suggestedOpeningLines.slice(0, 2).join(" "),
		});
	}
	if (blueprintLesson.watchouts.length > 0) {
		examples.push({
			id: "avoid-this",
			title: "Avoid this",
			body: blueprintLesson.watchouts.join(" "),
		});
	}
	if (blueprintLesson.suggestedClose.length > 0) {
		examples.push({
			id: "lock-it-in",
			title: "Lock it in",
			body: blueprintLesson.suggestedClose.join(" "),
		});
	}
	return examples;
}

function toLessonSpecificResources(blueprintLesson) {
	const blockKey = blueprintLesson.lessonId.split(".")[0];
	return [...(worksheetResourcesByBlock[blockKey] ?? [])];
}

function buildLessonContent(blueprintLesson) {
	const templateResource = templateResourceByLessonId[blueprintLesson.lessonId];
	return {
		lessonId: blueprintLesson.lessonId,
		slug: buildSlug(blueprintLesson.lessonId, blueprintLesson.title),
		status: "draft",
		intro: blueprintLesson.purpose,
		lessonMeta: {
			runtimeLabel: blueprintLesson.runtimeLabel,
			goal: blueprintLesson.goal,
			purpose: blueprintLesson.purpose,
		},
		actionCard: {
			jobNow: blueprintLesson.pausePrompt.jobNow,
			timebox: blueprintLesson.pausePrompt.timebox,
			comeBackWith: blueprintLesson.pausePrompt.comeBackWith,
		},
		coach: {
			video: {
				status: "pending",
				title: blueprintLesson.title,
			},
			transcript: {
				status: "empty",
			},
			examples: toCoachExamples(blueprintLesson),
			resources: toLessonSpecificResources(blueprintLesson),
		},
		workbench: {
			prompt:
				blueprintLesson.suggestedOpeningLines[0] ?? blueprintLesson.goal,
			teachingPoints: blueprintLesson.beatsToCover,
			emptyState:
				blueprintLesson.suggestedOpeningLines[0] ??
				blueprintLesson.purpose,
			templateDownloadLabel: templateResource?.label,
			templateDownloadHref: templateResource?.href,
		},
		sourceRefs: [
			"assets/ship_by_sunday_recording_blueprint_v3.md",
			"assets/ship_by_sunday_wireframes_v_1 (1).md",
		],
	};
}

async function writeLessonModule(lessonContent) {
	const constantName = slugToConstant(lessonContent.slug);
	const modulePath = path.join(contentDir, `${lessonContent.slug}.ts`);
	const source = `import type { LessonContent } from "@/content/lessons/types";

export const ${constantName}: LessonContent = ${JSON.stringify(lessonContent, null, 2)};
`;

	await fs.writeFile(modulePath, source);
	return { constantName, modulePath };
}

async function writeGeneratedBarrel(entries) {
	const imports = entries
		.map(
			({ constantName, lessonContent }) =>
				`import { ${constantName} } from "@/content/lessons/${lessonContent.slug}";`,
		)
		.join("\n");
	const exports = entries
		.map(({ constantName }) => `\t${constantName},`)
		.join("\n");
	const source = `${imports}
import type { LessonContent } from "@/content/lessons/types";

export const authoredLessonContent = [
${exports}
] as const satisfies readonly LessonContent[];
`;

	await fs.writeFile(generatedBarrelPath, source);
}

async function main() {
	const [blueprintMarkdown, wireframesMarkdown, registrySource] = await Promise.all([
		fs.readFile(blueprintPath, "utf8"),
		fs.readFile(wireframesPath, "utf8"),
		fs.readFile(registryPath, "utf8"),
	]);

	const parsedLessons = parseBlueprint(blueprintMarkdown);
	if (parsedLessons.length !== 28) {
		throw new Error(`Expected 28 lessons in blueprint, found ${parsedLessons.length}`);
	}

	validateWireframeLayouts(
		parseWireframes(wireframesMarkdown),
		parseRegistry(registrySource),
	);

	await fs.mkdir(sourceDir, { recursive: true });
	await fs.writeFile(intermediatePath, `${JSON.stringify(parsedLessons, null, 2)}\n`);

	const lessonContents = parsedLessons.map(buildLessonContent);
	const entries = [];
	for (const lessonContent of lessonContents) {
		const generated = await writeLessonModule(lessonContent);
		entries.push({ ...generated, lessonContent });
	}

	await writeGeneratedBarrel(entries);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
