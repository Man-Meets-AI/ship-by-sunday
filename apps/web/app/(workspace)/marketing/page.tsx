import { redirectToPacketStageEntry } from "@/features/packet-flow/server/packet-stage-route-data";

export default async function Page() {
	await redirectToPacketStageEntry("marketing");
}
