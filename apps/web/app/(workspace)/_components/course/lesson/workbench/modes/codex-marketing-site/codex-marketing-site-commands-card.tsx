"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { CODEX_MARKETING_COMMAND_SNIPPETS } from "@/lib/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-constants";

async function writeClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

export function CodexMarketingSiteCommandsCard() {
	const [feedback, setFeedback] = useState<string | null>(null);

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Command snippets</CardTitle>
				<CardDescription>
					Reuse these phrases with your agent when you want a pass only, or when
					you are ready to ship.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-0">
				{CODEX_MARKETING_COMMAND_SNIPPETS.map((snippet, index) => (
					<div key={snippet.id}>
						{index > 0 ? <Separator className="my-3" /> : null}
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<p className="font-mono text-xs leading-relaxed text-foreground">
								{snippet.text}
							</p>
							<Button
								type="button"
								variant="secondary"
								size="sm"
								className="shrink-0"
								onClick={() => {
									void writeClipboard(snippet.text).then((ok) => {
										setFeedback(
											ok
												? "Copied to clipboard."
												: "Could not copy—try selecting the text.",
										);
									});
								}}
							>
								Copy
							</Button>
						</div>
					</div>
				))}
				{feedback ? (
					<p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
						{feedback}
					</p>
				) : null}
			</CardContent>
		</Card>
	);
}
