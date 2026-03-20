"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import { CODEX_MARKETING_COMMAND_SNIPPETS } from "./codex-marketing-site-constants";

async function writeClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Copied");
	} catch {
		toast.error("Could not copy");
	}
}

export function CodexMarketingSiteCommandsCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Command snippets</CardTitle>
				<CardDescription>
					Reuse these phrases with your agent when you want a pass only, or
					when you are ready to ship.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{CODEX_MARKETING_COMMAND_SNIPPETS.map((snippet) => (
					<div
						key={snippet.id}
						className="flex flex-col gap-2 rounded-md border border-border bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
					>
						<p className="font-mono text-xs leading-relaxed text-foreground">
							{snippet.text}
						</p>
						<Button
							type="button"
							variant="secondary"
							size="sm"
							className="shrink-0"
							onClick={() => void writeClipboard(snippet.text)}
						>
							Copy
						</Button>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
