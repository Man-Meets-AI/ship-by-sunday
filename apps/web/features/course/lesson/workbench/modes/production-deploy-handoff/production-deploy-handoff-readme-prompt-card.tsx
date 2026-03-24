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

import { README_DEPLOY_PROMPT } from "./production-deploy-handoff-constants";

async function writeClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	} catch {
		toast.error("Could not copy—try selecting the text manually");
	}
}

export function ProductionDeployHandoffReadmePromptCard({
	productName,
	domain,
}: {
	productName: string;
	domain: string;
}) {
	const contextBlock =
		productName.trim() || domain.trim()
			? `\n\n---\nContext (non-secret)\nProduct name: ${productName.trim() || "(add above)"}\nDomain: ${domain.trim() || "(add above)"}\n`
			: "";

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">README deployment prompt</CardTitle>
				<CardDescription>
					Copy this into your agent so it reads the README deploy steps—then paste
					credentials only in the right place (env / dashboard), not in public
					channels.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Textarea
					readOnly
					className="min-h-[140px] resize-y font-mono text-xs"
					value={README_DEPLOY_PROMPT}
					aria-label="README deployment prompt"
				/>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() => void writeClipboard(README_DEPLOY_PROMPT)}
					>
						Copy prompt
					</Button>
					<Button
						type="button"
						size="sm"
						onClick={() =>
							void writeClipboard(`${README_DEPLOY_PROMPT}${contextBlock}`)
						}
					>
						Copy prompt + context
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
