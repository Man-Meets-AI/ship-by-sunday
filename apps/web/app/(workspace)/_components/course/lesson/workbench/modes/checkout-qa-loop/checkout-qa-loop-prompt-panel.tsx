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

import { CHECKOUT_QA_INSTRUCTOR_PROMPT } from "@/lib/course/lesson/workbench/modes/checkout-qa-loop/checkout-qa-loop-constants";

async function writeClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard");
	} catch {
		toast.error("Could not copy—try selecting the text manually");
	}
}

export function CheckoutQaLoopPromptPanel({
	value,
	onChange,
}: {
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const stored = typeof value === "string" ? value : "";
	const display = stored.trim() ? stored : CHECKOUT_QA_INSTRUCTOR_PROMPT;

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">QA test prompt</CardTitle>
				<CardDescription>
					Copy into your agent (QA Browser skill + Playwright). Prefilled with
					the instructor request; edit if your stack differs.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Textarea
					className="min-h-[200px] resize-y font-mono text-xs"
					value={display}
					onChange={(event) => onChange(event.target.value)}
					aria-label="QA test prompt"
				/>
				<div className="flex flex-wrap gap-2">
					<Button
						type="button"
						variant="secondary"
						size="sm"
						onClick={() => void writeClipboard(display)}
					>
						Copy prompt
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						onClick={() => onChange(CHECKOUT_QA_INSTRUCTOR_PROMPT)}
					>
						Reset to template
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
