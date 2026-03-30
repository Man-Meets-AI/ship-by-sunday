"use client";

import { useState } from "react";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import type { PostReviewNavigationTargets } from "@/features/workspace-navigation/lib/post-review-destination";
import { PacketReviewCheckpointCard } from "./packet-review-checkpoint-card";
import { PacketReviewExecutePreview } from "./packet-review-execute-preview";

function getArchiveFileName(contentDisposition: string | null) {
	const fileNameMatch = contentDisposition?.match(/filename="([^"]+)"/);
	return fileNameMatch?.[1] ?? "ship-kit.zip";
}

async function downloadStarterArchive() {
	const response = await fetch("/api/download/repo", {
		method: "GET",
		credentials: "same-origin",
	});
	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage || "Ship Kit download failed.");
	}

	const archive = await response.blob();
	const downloadUrl = URL.createObjectURL(archive);
	const downloadLink = document.createElement("a");
	downloadLink.href = downloadUrl;
	downloadLink.download = getArchiveFileName(
		response.headers.get("content-disposition"),
	);
	document.body.append(downloadLink);
	downloadLink.click();
	downloadLink.remove();
	URL.revokeObjectURL(downloadUrl);
}

export function PacketReviewDownloadBridge({
	onOpenLessonMap,
	workspaceState,
	postReviewTargets,
}: {
	onOpenLessonMap?: () => void;
	workspaceState: PacketWorkspaceState;
	postReviewTargets: PostReviewNavigationTargets | null;
}) {
	const isReviewReady = workspaceState.packetReadiness.review.isReady;
	const packetReadiness = workspaceState.packetReadiness;
	const isExecuteUnlocked = Boolean(
		workspaceState.workflowState?.executeShipUnlockedAt,
	);
	const [hasCompletedStarterDownload, setHasCompletedStarterDownload] =
		useState(false);
	const [isDownloadPending, setIsDownloadPending] = useState(false);
	const [downloadError, setDownloadError] = useState<string | null>(null);
	const hasUnlockedReviewFlow =
		isExecuteUnlocked || hasCompletedStarterDownload;

	async function handleStarterDownload(event: { preventDefault: () => void }) {
		event.preventDefault();
		if (!isReviewReady || isDownloadPending) {
			return;
		}

		setIsDownloadPending(true);
		setDownloadError(null);
		try {
			await downloadStarterArchive();
			setHasCompletedStarterDownload(true);
		} catch (error) {
			setDownloadError(
				error instanceof Error
					? error.message
					: "Ship Kit download failed.",
			);
		} finally {
			setIsDownloadPending(false);
		}
	}

	return (
		<div className="flex flex-col gap-6">
			<PacketReviewCheckpointCard
				isReviewReady={isReviewReady}
				isDownloadPending={isDownloadPending}
				packetReadiness={packetReadiness}
				downloadError={downloadError}
				onStarterDownload={handleStarterDownload}
			/>
			<PacketReviewExecutePreview
				buildLessonsHref={postReviewTargets?.buildLessonsDestination ?? null}
				isReviewReady={isReviewReady}
				hasUnlockedReviewFlow={hasUnlockedReviewFlow}
				isDownloadPending={isDownloadPending}
				onStarterDownload={handleStarterDownload}
				onOpenLessonMap={onOpenLessonMap}
			/>
		</div>
	);
}
