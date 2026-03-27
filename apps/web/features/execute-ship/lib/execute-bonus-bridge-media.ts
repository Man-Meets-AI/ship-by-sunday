import type { PacketPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";

const executeBonusBridgeMedia = {
	kind: "video",
	eyebrow: "Bridge video",
	badge: "Execute / Ship",
	title: "Execute / Ship orientation",
	description:
		"Watch this first so the Execute / Ship handoff stays anchored to the packet-first flow before you continue in BUILD.",
	video: {
		status: "ready",
		provider: "bunny",
		libraryId: 619172,
		videoId: "3382315c-5cec-4d1c-aa37-611f8b52e6cf",
		title: "Execute / Ship orientation",
	},
} as const satisfies PacketPageMedia;

export function getExecuteBonusBridgeMedia() {
	return executeBonusBridgeMedia;
}
