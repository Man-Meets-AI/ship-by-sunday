"use client";

import { motion } from "motion/react";
import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import { getPacketStartPageMedia } from "@/features/packet-flow/lib/packet-stage-videos";

export function PacketStartWelcomeVideoCard() {
	const media = getPacketStartPageMedia();
	if (media.kind !== "video") return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				delay: 0.2,
				duration: 0.55,
				ease: [0.25, 0.46, 0.45, 0.94],
			}}
		>
			<LessonVideoPlayer
				video={media.video}
				title={media.video.title ?? media.title}
				className="aspect-video w-full rounded-xl border-0 bg-black"
			/>
		</motion.div>
	);
}
