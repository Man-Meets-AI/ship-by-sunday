"use client";

import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import { PacketReviewCheckpointCard } from "./packet-review-checkpoint-card";
import { PacketReviewExecutePreview } from "./packet-review-execute-preview";

export function PacketReviewDownloadBridge({
	isReviewReady,
	executeShipUnlockedAt,
}: {
	isReviewReady: boolean;
	executeShipUnlockedAt?: number;
}) {
	const router = useRouter();
	const unlockExecuteShip = useMutation(api.packet.unlockExecuteShip);
	const [hasTriggeredStarterDownload, setHasTriggeredStarterDownload] =
		useState(Boolean(executeShipUnlockedAt));
	const [isExecuteUnlocked, setIsExecuteUnlocked] = useState(
		Boolean(executeShipUnlockedAt),
	);
	const [isPending, startTransition] = useTransition();

	function handleStarterDownload() {
		if (!isReviewReady) {
			return;
		}

		setHasTriggeredStarterDownload(true);
	}

	function handleUnlockExecuteShip() {
		if (!isReviewReady || !hasTriggeredStarterDownload || isExecuteUnlocked) {
			return;
		}

		startTransition(async () => {
			await unlockExecuteShip({});
			setIsExecuteUnlocked(true);
			router.push(routeConfig.execute);
		});
	}

	return (
		<div className="space-y-6">
			<PacketReviewCheckpointCard
				isReviewReady={isReviewReady}
				isExecuteUnlocked={isExecuteUnlocked}
				onStarterDownload={handleStarterDownload}
			/>
			<PacketReviewExecutePreview
				isReviewReady={isReviewReady}
				hasTriggeredStarterDownload={hasTriggeredStarterDownload}
				isExecuteUnlocked={isExecuteUnlocked}
				isUnlockPending={isPending}
				onUnlockExecuteShip={handleUnlockExecuteShip}
			/>
		</div>
	);
}
