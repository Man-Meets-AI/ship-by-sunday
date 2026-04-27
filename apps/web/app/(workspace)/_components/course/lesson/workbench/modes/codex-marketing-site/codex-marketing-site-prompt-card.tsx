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
import { Textarea } from "@/components/ui/textarea";

import { MARKETING_SITE_PROMPT_TEMPLATE } from "@/lib/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-constants";

async function writeClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}

export function CodexMarketingSitePromptCard() {
	const [feedback, setFeedback] = useState<string | null>(null);

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Reusable base prompt</CardTitle>
				<CardDescription>
					Copy this into ChatGPT (subscription required), then paste your
					structured brief from below in the next message.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Textarea
					readOnly
					className="min-h-[220px] resize-y font-mono text-xs leading-relaxed"
					value={MARKETING_SITE_PROMPT_TEMPLATE}
					aria-label="Marketing site prompt template"
				/>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() => {
							void writeClipboard(MARKETING_SITE_PROMPT_TEMPLATE).then((ok) => {
								setFeedback(
									ok
										? "Copied to clipboard."
										: "Could not copy—try selecting the text manually.",
								);
							});
						}}
					>
						Copy prompt
					</Button>
					{feedback ? (
						<span className="text-xs text-muted-foreground" aria-live="polite">
							{feedback}
						</span>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
