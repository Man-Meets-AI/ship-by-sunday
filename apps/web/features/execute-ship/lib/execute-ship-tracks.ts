import { routeConfig } from "@/config/product";
import {
	REVIEW_DOWNLOAD_HREF,
	REVIEW_REDOWNLOAD_LINK_LABEL,
} from "@/features/blueprint-flow/lib/review-download-handoff";

export type ExecuteShipTrackId =
	| "build-now"
	| "refine-design"
	| "refine-marketing"
	| "qa-debug"
	| "launch-ship";

export type ExecuteShipTrack = {
	id: ExecuteShipTrackId;
	label: string;
	status: "now" | "ready";
	summary: string;
	objective: string;
	steps: string[];
	links: Array<{
		label: string;
		href: string;
	}>;
};

export const executeShipTracks: ExecuteShipTrack[] = [
	{
		id: "build-now",
		label: "Build Now",
		status: "now",
		summary:
			"Turn the Build docs inside the Ship by Sunday Blueprint into the first implementation pass.",
		objective:
			"Start with the smallest shippable slice from your build blueprint.",
		steps: [
			"Open the Ship by Sunday Blueprint and pull the first slice from the Build Pack.",
			"Implement the slice without widening scope beyond the blueprint contract.",
			"Run the narrowest checks first, then widen validation only after the slice is green.",
		],
		links: [
			{ label: "Review Pricing", href: "/blueprint#pricing" },
			{
				label: REVIEW_REDOWNLOAD_LINK_LABEL,
				href: REVIEW_DOWNLOAD_HREF,
			},
		],
	},
	{
		id: "refine-design",
		label: "Refine Design",
		status: "ready",
		summary:
			"Use the Design docs inside the Ship by Sunday Blueprint to tighten the product surface before coding deeper.",
		objective:
			"Convert the design blueprint into one clearer interface decision at a time.",
		steps: [
			"Re-read the visual thesis, content plan, and interaction thesis before editing UI.",
			"Choose one surface that needs polish instead of reopening the whole design pass.",
			"Capture proof with screenshots or focused UI tests before moving on.",
		],
		links: [
			{ label: "Open Blueprint Design", href: "/blueprint#design" },
			{ label: "Open Review", href: routeConfig.review },
		],
	},
	{
		id: "refine-marketing",
		label: "Refine Marketing",
		status: "ready",
		summary:
			"Use the Marketing docs inside the Ship by Sunday Blueprint to sharpen the offer, proof, and launch copy.",
		objective:
			"Ship one stronger conversion or messaging pass instead of rewriting everything.",
		steps: [
			"Start with the highest-value surface: homepage, launch page, or lifecycle email.",
			"Keep the approved claims and do-not-say rules visible while editing copy.",
			"Check that the visible promise still matches the blueprint and the real product state.",
		],
		links: [
			{ label: "Open Generated Preview", href: "/blueprint#generated-preview" },
			{ label: "Open Review", href: routeConfig.review },
		],
	},
	{
		id: "qa-debug",
		label: "QA & Debug",
		status: "ready",
		summary:
			"Use the blueprint and repo snapshot to run the next verification loop.",
		objective: "Find the highest-risk regression before it reaches launch day.",
		steps: [
			"Walk the demo flow from the Build Pack before inventing extra scenarios.",
			"Reproduce one issue at a time and keep the fix scoped to the failing surface.",
			"Capture the command or browser proof that shows the issue is actually closed.",
		],
		links: [
			{ label: "Review Stage", href: routeConfig.review },
			{
				label: REVIEW_REDOWNLOAD_LINK_LABEL,
				href: REVIEW_DOWNLOAD_HREF,
			},
		],
	},
	{
		id: "launch-ship",
		label: "Launch & Ship",
		status: "ready",
		summary:
			"Bundle the build, the validation proof, and the release story into a ship pass.",
		objective:
			"Move from working build to a release candidate with a clean handoff.",
		steps: [
			"Confirm the domain, support, and pricing details still match the build and marketing surfaces.",
			"Run the final validation pass from the blueprint instead of inventing a new checklist.",
			"Write the release handoff in plain language so the next operator knows what changed and what still needs watching.",
		],
		links: [
			{ label: "Open Blueprint Setup", href: "/blueprint#setup" },
			{ label: "Open Review", href: routeConfig.review },
		],
	},
];

export function getExecuteShipTrack(trackId: ExecuteShipTrackId) {
	return (
		executeShipTracks.find((track) => track.id === trackId) ??
		executeShipTracks[0]
	);
}
