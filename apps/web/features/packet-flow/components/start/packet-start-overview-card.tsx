"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { getPacketStageDefinition, type PacketStageId } from "@packet-compiler";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function PacketStartOverviewCard({
	nextStageId,
}: {
	nextStageId: PacketStageId;
}) {
	const nextStage = getPacketStageDefinition(nextStageId);

	return (
		<section className="flex flex-col items-center text-center space-y-10">
			<div className="space-y-6">
				<motion.h2
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease }}
					className="font-marketing-display text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight uppercase"
				>
					Build the folder before you build the app.
				</motion.h2>
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.08, duration: 0.55, ease }}
					className="max-w-xl text-lg md:text-xl leading-relaxed text-muted-foreground mx-auto"
				>
					Watch the welcome video, then work the packet in order — Product,
					Design, Marketing, Build Plan, and Review. Keep the answers sharp
					enough to ship something real by Sunday.
				</motion.p>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.16, duration: 0.5, ease }}
			>
				<Button asChild size="lg" className="h-14 px-8 text-lg rounded-full">
					<Link href={nextStage.route}>Continue with {nextStage.label}</Link>
				</Button>
			</motion.div>
		</section>
	);
}
