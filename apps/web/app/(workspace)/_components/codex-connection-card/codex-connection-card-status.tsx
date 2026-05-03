"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import type { ConnectionState } from "@/app/(workspace)/_components/codex-connection-card/codex-connection-card-model";
import { cn } from "@/lib/utils";

function StatusDot({ connected }: { connected: boolean }) {
	return (
		<span
			className={cn(
				"mt-1.5 size-2 shrink-0 rounded-full",
				connected
					? "bg-emerald-600 dark:bg-emerald-400"
					: "bg-amber-600 dark:bg-amber-400",
			)}
			aria-hidden
		/>
	);
}

export function CodexConnectionStatusCard({
	connection,
}: {
	connection: Pick<ConnectionState, "account" | "connected">;
}) {
	const reduceMotion = useReducedMotion() ?? false;
	const statusKey = connection.connected ? "connected" : "disconnected";
	const chatgptAccount =
		connection.account?.type === "chatgpt" ? connection.account : null;
	const isChatGpt = Boolean(chatgptAccount);
	const isApiKey = connection.account?.type === "apiKey";

	return (
		<div className="rounded-lg border border-border/60 bg-muted/30 ring-1 ring-foreground/5">
			<AnimatePresence initial={false} mode="wait">
				<motion.div
					key={statusKey}
					initial={reduceMotion ? undefined : { opacity: 0, y: 4 }}
					animate={{ opacity: 1, y: 0 }}
					exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
					transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
					className="p-3"
				>
					<div className="flex gap-3">
						<StatusDot connected={connection.connected} />
						<div className="min-w-0 flex-1 space-y-0.5">
							<h3 className="text-sm font-medium text-foreground">
								{connection.connected ? "Connected" : "Not connected"}
							</h3>
							<p className="text-xs text-muted-foreground">
								{connection.connected
									? isApiKey
										? "API key authentication"
										: isChatGpt
											? "ChatGPT subscription linked for in-lesson generation"
											: "Subscription linked"
									: "Connect to use your ChatGPT Plus or Codex subscription in lessons."}
							</p>
						</div>
					</div>

					{connection.connected && chatgptAccount ? (
						<dl className="mt-3 space-y-2 border-t border-border/40 pt-3 text-sm">
							<div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
								<dt className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
									Email
								</dt>
								<dd className="min-w-0 break-all text-foreground font-number">
									{chatgptAccount.email}
								</dd>
							</div>
							<div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
								<dt className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase">
									Plan
								</dt>
								<dd className="text-foreground">{chatgptAccount.planType}</dd>
							</div>
						</dl>
					) : null}
				</motion.div>
			</AnimatePresence>
		</div>
	);
}
