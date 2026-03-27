"use client";

import { useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { PacketReviewCheckpointCard } from "./packet-review-checkpoint-card";
import { PacketReviewExecutePreview } from "./packet-review-execute-preview";

export function PacketReviewDownloadBridge({
	initialWorkspaceState,
}: {
	initialWorkspaceState: PacketWorkspaceState;
}) {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useConvexAuth();
	const liveWorkspaceState = useQuery(
		api.packet.getPacketWorkspaceState,
		isAuthenticated && !isLoading ? {} : "skip",
	) as PacketWorkspaceState | undefined;
	const workspaceState = liveWorkspaceState ?? initialWorkspaceState;
	const isReviewReady = workspaceState.packetReadiness.review.isReady;
	const packetReadiness = workspaceState.packetReadiness;
	const isExecuteUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const unlockExecuteShip = useMutation(api.packet.unlockExecuteShip);
	const [hasRequestedStarterDownload, setHasRequestedStarterDownload] =
		useState(false);
	const [isUnlockPending, setIsUnlockPending] = useState(false);
	const hasTriggeredStarterDownload =
		hasRequestedStarterDownload || isExecuteUnlocked;

	function handleStarterDownload() {
		if (!isReviewReady) {
			return;
		}

		setHasRequestedStarterDownload(true);
	}

	async function handleUnlockExecuteShip() {
		if (
			!isReviewReady ||
			!hasTriggeredStarterDownload ||
			isExecuteUnlocked ||
			isUnlockPending
		) {
			return;
		}

		setIsUnlockPending(true);
		try {
			await unlockExecuteShip({});
			router.push(routeConfig.execute);
		} catch (error) {
			setIsUnlockPending(false);
			throw error;
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<PacketReviewCheckpointCard
				isReviewReady={isReviewReady}
				packetReadiness={packetReadiness}
				isExecuteUnlocked={isExecuteUnlocked}
				onStarterDownload={handleStarterDownload}
			/>
			<PacketReviewExecutePreview
				isReviewReady={isReviewReady}
				hasTriggeredStarterDownload={hasTriggeredStarterDownload}
				isExecuteUnlocked={isExecuteUnlocked}
				isUnlockPending={isUnlockPending}
				onUnlockExecuteShip={handleUnlockExecuteShip}
			/>
		</div>
	);
}
