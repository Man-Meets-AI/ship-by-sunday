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
import { Textarea } from "@/components/ui/textarea";

import { MARKETING_SITE_PROMPT_TEMPLATE } from "./codex-marketing-site-constants";

async function writeClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	} catch {
		toast.error("Could not copy—try selecting the text manually");
	}
}

export function CodexMarketingSitePromptCard() {
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
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => void writeClipboard(MARKETING_SITE_PROMPT_TEMPLATE)}
				>
					Copy prompt
				</Button>
			</CardContent>
		</Card>
	);
}
