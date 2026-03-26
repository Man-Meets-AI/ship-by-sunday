import { PacketVideoCard } from "@/features/packet-flow/components/video/packet-video-card";
import { getPacketStartPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";

export function PacketStartWelcomeVideoCard() {
	return <PacketVideoCard content={getPacketStartPageMedia()} />;
}
