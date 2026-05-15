"use client";

import { useClerk, useSession } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { AlertTriangle, ShieldAlert, Square } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { SupportModeStatus } from "@/platform/admin-impersonation";

import {
	formatSupportModeTimeRemaining,
	getSupportModeMessage,
	shouldRenderSupportModeStatus,
} from "./support-mode-bar-model";

const ADMIN_IMPERSONATION_PATH = "/admin/impersonation";

export function SupportModeBar({
	initialStatus,
}: {
	initialStatus?: SupportModeStatus | null;
}) {
	const liveStatus = useQuery(api.impersonation.getSupportModeStatus);
	const stopCurrentSession = useMutation(api.impersonation.stopCurrentSession);
	const clerk = useClerk();
	const { isLoaded: sessionIsLoaded, session } = useSession();
	const [isPending, startTransition] = useTransition();
	const status = liveStatus ?? initialStatus ?? null;
	const [remainingMs, setRemainingMs] = useState(
		status?.timeRemainingMs ?? null,
	);
	const [stopError, setStopError] = useState<string | null>(null);

	useEffect(() => {
		setRemainingMs(status?.timeRemainingMs ?? null);
		if (!status?.timeRemainingMs) {
			return;
		}
		const startedAt = Date.now();
		const initialRemainingMs = status.timeRemainingMs;
		const timer = window.setInterval(() => {
			setRemainingMs(
				Math.max(0, initialRemainingMs - (Date.now() - startedAt)),
			);
		}, 30_000);
		return () => window.clearInterval(timer);
	}, [status?.timeRemainingMs]);

	const warningText = useMemo(() => {
		if (!status || status.integrityWarnings.length === 0) {
			return null;
		}
		return status.integrityWarnings.join(", ");
	}, [status]);

	if (!status || !shouldRenderSupportModeStatus(status)) {
		return null;
	}

	function stopSupportMode() {
		setStopError(null);
		if (!sessionIsLoaded || !session?.id) {
			setStopError("Clerk session is still loading.");
			return;
		}
		if (!session.actor) {
			setStopError("No Clerk actor session is active.");
			return;
		}
		const actorSessionId = session.id;
		startTransition(async () => {
			try {
				if (status?.stopEligible) {
					await stopCurrentSession({});
				}
			} catch (error) {
				setStopError(
					error instanceof Error
						? error.message
						: "Unable to close the Convex support session.",
				);
			} finally {
				await clerk.signOut({
					sessionId: actorSessionId,
					redirectUrl: ADMIN_IMPERSONATION_PATH,
				});
			}
		});
	}

	return (
		<section className="border-b border-amber-400/50 bg-amber-500 text-amber-950 shadow-sm">
			<div className="mx-auto flex w-full max-w-[1920px] flex-col gap-2 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
				<div className="flex min-w-0 items-start gap-2">
					{status.state === "active" ? (
						<ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
					) : (
						<AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
					)}
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
							<span>{getSupportModeMessage(status)}</span>
							<span className="max-w-[18rem] truncate sm:max-w-[24rem]">
								{status.customerEmail ?? "unknown customer"}
							</span>
							<span>{formatSupportModeTimeRemaining(remainingMs)}</span>
						</div>
						{status.reason ? (
							<div
								className="max-w-[52rem] truncate text-xs text-amber-950/85"
								title={status.reason}
							>
								{status.reason}
							</div>
						) : null}
						{warningText ? (
							<div className="text-xs text-amber-950/85">
								Integrity warnings: {warningText}
							</div>
						) : null}
						{stopError ? (
							<div className="text-xs font-medium">{stopError}</div>
						) : null}
					</div>
				</div>
				<Button
					type="button"
					variant="outline"
					size="sm"
					className="border-amber-950/40 bg-amber-50 text-amber-950 hover:bg-amber-100"
					onClick={stopSupportMode}
					disabled={
						isPending || !sessionIsLoaded || !session?.id || !session.actor
					}
				>
					<Square className="size-3" aria-hidden />
					Stop impersonating
				</Button>
			</div>
		</section>
	);
}
