"use client";

import { useState } from "react";
import { Check, Clipboard } from "lucide-react";

import { ProtectedRoutePanel } from "@/components/app/protected-route-surface";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type WorkspaceOperatorSummaryRow = {
	label: string;
	value: string;
	copyValue?: string;
	mono?: boolean;
	title?: string;
};

export function WorkspaceOperatorSummaryCard({
	rows,
	title,
}: {
	rows: WorkspaceOperatorSummaryRow[];
	title?: string;
}) {
	return (
		<ProtectedRoutePanel
			aria-label={title ?? "Workspace summary"}
			data-slot="protected-route-summary"
			className="grid min-w-0 gap-2 p-3 text-xs"
		>
			{title ? (
				<p className="border-b border-border/60 pb-2 font-medium text-foreground">
					{title}
				</p>
			) : null}
			<div className="grid gap-1.5">
				{rows.map((row) => (
					<WorkspaceOperatorSummaryCardRow
						key={`${row.label}:${row.value}`}
						row={row}
					/>
				))}
			</div>
		</ProtectedRoutePanel>
	);
}

function WorkspaceOperatorSummaryCardRow({
	row,
}: {
	row: WorkspaceOperatorSummaryRow;
}) {
	const [copied, setCopied] = useState(false);
	const copyValue = row.copyValue?.trim();

	async function copyRowValue() {
		if (!copyValue || !navigator.clipboard?.writeText) {
			return;
		}

		await navigator.clipboard.writeText(copyValue);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1200);
	}

	return (
		<div className="grid min-w-0 grid-cols-[5.25rem_minmax(0,1fr)_1.5rem] items-start gap-2">
			<span className="pt-1 text-muted-foreground">{row.label}</span>
			<span
				className={cn(
					"min-w-0 break-words pt-1 text-right font-medium leading-5 text-foreground",
					row.mono ? "break-all font-mono text-[11px]" : null,
				)}
				title={row.title ?? copyValue ?? row.value}
			>
				{row.value}
			</span>
			{copyValue ? (
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-6 justify-self-end"
					aria-label={`Copy ${row.label}`}
					onClick={() => void copyRowValue()}
				>
					{copied ? (
						<Check className="size-3.5" aria-hidden />
					) : (
						<Clipboard className="size-3.5" aria-hidden />
					)}
				</Button>
			) : (
				<span aria-hidden />
			)}
		</div>
	);
}
