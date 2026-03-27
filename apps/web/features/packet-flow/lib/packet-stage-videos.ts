import type { LessonVideoContent } from "@/features/course/lesson/model/contracts";
import type { RoutedPacketStageId } from "@/features/packet-flow/lib/packet-stage-routes";

const PACKET_BUNNY_LIBRARY_ID = 619172;

function buildPacketBunnyVideo(
	title: string,
	videoId: string,
): LessonVideoContent {
	return {
		status: "ready",
		provider: "bunny",
		libraryId: PACKET_BUNNY_LIBRARY_ID,
		videoId,
		title,
	};
}

export type PacketPageMedia =
	| {
			kind: "video";
			eyebrow: string;
			badge: string;
			title: string;
			description: string;
			video: LessonVideoContent;
	  }
	| {
			kind: "orientation";
			eyebrow: string;
			badge: string;
			title: string;
			description: string;
			body: string;
	  };

type PacketStagePageKey = `${RoutedPacketStageId}/${string}`;

const packetStagePageMedia: Record<PacketStagePageKey, PacketPageMedia> = {
	"product/foundation": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Product",
		title: "Name the thing",
		description:
			"Lock the name, summary, user, and why-this-matters frame before the rest of Product.",
		video: buildPacketBunnyVideo(
			"Product Foundation Video",
			"45709ba2-9bd2-4c9d-92e4-ea839b677408",
		),
	},
	"product/problem": {
		kind: "orientation",
		eyebrow: "Read first",
		badge: "Product",
		title: "Problem checkpoint",
		description:
			"This page is intentionally text-first until the L2 recording is uploaded.",
		body: "Capture the problem, context, trigger, severity, and urgency so the next packet page lands on a sharp problem definition.",
	},
	"product/outcome": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Product",
		title: "Lock the promise and the proof",
		description:
			"Use this page to sharpen the promised outcome and the evidence behind it.",
		video: buildPacketBunnyVideo(
			"Product Outcome Video",
			"0d7bff45-2dbb-4722-9a1d-de22a8348629",
		),
	},
	"product/scope": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Product",
		title: "Kill scope early",
		description:
			"Trim the product to the v1 that still earns belief and momentum.",
		video: buildPacketBunnyVideo(
			"Product Scope Video",
			"ea50b4a6-b573-40f5-9cc1-ff1c67126b14",
		),
	},
	"design/flow": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Design",
		title: "Map the core flow",
		description:
			"Define the screen sequence and must-have capabilities before references or style decisions.",
		video: buildPacketBunnyVideo(
			"Design Flow Video",
			"734ea653-f95c-4208-9e69-914c8858b015",
		),
	},
	"design/references": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Design",
		title: "Gather references",
		description:
			"Collect the visual signals and brand assets that should shape the interface.",
		video: buildPacketBunnyVideo(
			"Design References Video",
			"73d7350c-5689-46a5-a896-b212098fb8df",
		),
	},
	"design/direction": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Design",
		title: "Choose the visual direction",
		description:
			"Lock the visual thesis, content plan, and interaction tone before system work.",
		video: buildPacketBunnyVideo(
			"Design Direction Video",
			"1a9d846c-e439-4a9b-9b89-9d5409f0e443",
		),
	},
	"design/system": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Design",
		title: "Define the system",
		description:
			"Finish the design packet by locking tokens, typography, imagery, and layout direction.",
		video: buildPacketBunnyVideo(
			"Design System Video",
			"bcdd6030-6598-4019-a831-6243f200a919",
		),
	},
	"marketing/operating-system": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Marketing",
		title: "Define the marketing operating system",
		description:
			"Use one page to lock goals, voice, proof, workflows, and research scope.",
		video: buildPacketBunnyVideo(
			"Marketing Operating System Video",
			"a0b0e9c7-2ba7-410d-b36a-cd1a45272fab",
		),
	},
	"build-plan/delivery": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Build Plan",
		title: "Choose delivery and pricing",
		description:
			"Lock the buyer-facing delivery model, pricing, and install destination before planning execution.",
		video: buildPacketBunnyVideo(
			"Build Plan Delivery Video",
			"b8d44210-c8c5-46a0-9d20-1998f3128aef",
		),
	},
	"build-plan/plan": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Build Plan",
		title: "Plan the work",
		description:
			"Use this page to lock constraints, deliverables, risks, dependencies, and the next slice.",
		video: buildPacketBunnyVideo(
			"Build Plan Work Plan Video",
			"17e493f8-1b23-40d6-ac06-bdeac5ec32d6",
		),
	},
	"build-plan/validation": {
		kind: "video",
		eyebrow: "Watch first",
		badge: "Build Plan",
		title: "Define done and validation",
		description:
			"Finish the build plan by spelling out done-when, acceptance, and the demo flow.",
		video: buildPacketBunnyVideo(
			"Build Plan Validation Video",
			"6b2b6525-b1c0-4d70-811c-d901caf138c1",
		),
	},
};

const packetStartPageMedia: PacketPageMedia = {
	kind: "video",
	eyebrow: "Watch first",
	badge: "Welcome",
	title: "Welcome video",
	description:
		"Build the folder, not just the app, before you jump into Product.",
	video: buildPacketBunnyVideo(
		"Welcome Video",
		"9b219f52-c2ed-450b-ab3f-3ef9ab3a870f",
	),
};

const packetReviewPageMedia: PacketPageMedia = {
	kind: "video",
	eyebrow: "Final pass",
	badge: "Review",
	title: "Review video",
	description:
		"Resolve the last blockers, then download the packet and starter snapshot.",
	video: buildPacketBunnyVideo(
		"Review Video",
		"61a62066-fb78-46e0-b788-6965eab8218b",
	),
};

export function getPacketStagePageMedia(
	stageId: RoutedPacketStageId,
	stepId: string,
) {
	return packetStagePageMedia[`${stageId}/${stepId}`] ?? null;
}

export function getPacketStartPageMedia() {
	return packetStartPageMedia;
}

export function getPacketReviewPageMedia() {
	return packetReviewPageMedia;
}
