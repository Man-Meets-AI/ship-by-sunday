import { routeConfig } from "@/config/product";

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
		summary: "Turn the Build Pack into the first implementation pass.",
		objective:
			"Start with the smallest shippable slice from your build packet.",
		steps: [
			"Open the Starter Snapshot and pull the first slice from the Build Pack.",
			"Implement the slice without widening scope beyond the packet contract.",
			"Run the narrowest checks first, then widen validation only after the slice is green.",
		],
		links: [
			{ label: "Review Build Plan", href: routeConfig.buildPlan },
			{ label: "Download Starter Snapshot", href: "/api/download/repo" },
		],
	},
	{
		id: "refine-design",
		label: "Refine Design",
		status: "ready",
		summary:
			"Use the Design Pack to tighten the product surface before coding deeper.",
		objective:
			"Convert the design packet into one clearer interface decision at a time.",
		steps: [
			"Re-read the visual thesis, content plan, and interaction thesis before editing UI.",
			"Choose one surface that needs polish instead of reopening the whole design pass.",
			"Capture proof with screenshots or focused UI tests before moving on.",
		],
		links: [
			{ label: "Open Design Stage", href: routeConfig.design },
			{ label: "Download Design Pack", href: "/api/download/packet/design" },
		],
	},
	{
		id: "refine-marketing",
		label: "Refine Marketing",
		status: "ready",
		summary:
			"Use the Marketing Pack to sharpen the offer, proof, and launch copy.",
		objective:
			"Ship one stronger conversion or messaging pass instead of rewriting everything.",
		steps: [
			"Start with the highest-value surface: homepage, launch page, or lifecycle email.",
			"Keep the approved claims and do-not-say rules visible while editing copy.",
			"Check that the visible promise still matches the packet and the real product state.",
		],
		links: [
			{ label: "Open Marketing Stage", href: routeConfig.marketing },
			{
				label: "Download Marketing Pack",
				href: "/api/download/packet/marketing",
			},
		],
	},
	{
		id: "qa-debug",
		label: "QA & Debug",
		status: "ready",
		summary:
			"Use the packet and repo snapshot to run the next verification loop.",
		objective: "Find the highest-risk regression before it reaches launch day.",
		steps: [
			"Walk the demo flow from the Build Pack before inventing extra scenarios.",
			"Reproduce one issue at a time and keep the fix scoped to the failing surface.",
			"Capture the command or browser proof that shows the issue is actually closed.",
		],
		links: [
			{ label: "Review Stage", href: routeConfig.review },
			{ label: "Download Starter Snapshot", href: "/api/download/repo" },
		],
	},
	{
		id: "launch-ship",
		label: "Launch & Ship",
		status: "ready",
		summary:
			"Package the build, the validation proof, and the release story into a ship pass.",
		objective:
			"Move from working build to a release candidate with a clean handoff.",
		steps: [
			"Confirm the domain, support, and pricing details still match the build and marketing surfaces.",
			"Run the final validation pass from the packet instead of inventing a new checklist.",
			"Write the release handoff in plain language so the next operator knows what changed and what still needs watching.",
		],
		links: [
			{ label: "Open Build Plan", href: routeConfig.buildPlan },
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
