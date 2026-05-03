"use client";

import type { PresetConfig } from "@/lib/blueprint-flow/blueprint-theme-helpers";

export function PreviewWelcomeCard({ style }: { style: string }) {
	const isMinimal = style === "mira" || style === "lyra";

	return (
		<div
			className="flex flex-col gap-2 p-3 transition-all duration-300 motion-reduce:transition-none"
			style={{
				borderRadius: "var(--radius)",
				border: isMinimal
					? "none"
					: "var(--preview-border-w) solid var(--border)",
				boxShadow: "var(--preview-shadow)",
				backgroundColor: "var(--card)",
				color: "var(--card-foreground)",
			}}
		>
			<div>
				<div className="text-[11px] font-medium">Welcome back</div>
				<div
					className="text-[9px] leading-relaxed"
					style={{ color: "var(--muted-foreground)" }}
				>
					Your project is ready to ship.
				</div>
			</div>
			<button
				type="button"
				className="h-6 w-fit px-2.5 text-[10px] font-medium transition-all duration-300 hover:opacity-90 motion-reduce:transition-none"
				style={{
					borderRadius: "calc(var(--radius) * 0.65)",
					backgroundColor: "var(--primary)",
					color: "var(--primary-foreground)",
				}}
			>
				Get started
			</button>
		</div>
	);
}

export function PreviewStatCard({
	label,
	value,
	delta,
}: {
	label: string;
	value: string;
	delta: string;
}) {
	return (
		<div
			className="flex flex-col gap-1 p-2 transition-all duration-300 motion-reduce:transition-none"
			style={{
				borderRadius: "var(--radius)",
				border: "var(--preview-border-w) solid var(--border)",
				boxShadow: "var(--preview-shadow)",
			}}
		>
			<span className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>
				{label}
			</span>
			<div className="flex items-baseline gap-1">
				<span className="text-sm font-semibold font-number">{value}</span>
				<span
					className="text-[9px] font-medium"
					style={{ color: "var(--primary)" }}
				>
					{delta}
				</span>
			</div>
		</div>
	);
}

export function PreviewInputRow() {
	return (
		<div className="flex flex-col gap-1">
			<span className="text-[9px] font-medium">Project name</span>
			<div
				className="flex h-6 items-center px-2 text-[10px] transition-all duration-300 motion-reduce:transition-none"
				style={{
					borderRadius: "calc(var(--radius) * 0.65)",
					border: "1px solid var(--input)",
					backgroundColor: "var(--background)",
					color: "var(--muted-foreground)",
				}}
			>
				my-app
			</div>
		</div>
	);
}

export function PreviewBadgeRow({ config }: { config: PresetConfig }) {
	return (
		<div className="flex flex-wrap gap-1">
			<span
				className="inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-medium transition-all duration-300 motion-reduce:transition-none"
				style={{
					backgroundColor: "var(--primary)",
					color: "var(--primary-foreground)",
				}}
			>
				{config.style}
			</span>
			<span
				className="inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-medium transition-all duration-300 motion-reduce:transition-none"
				style={{
					border: "1px solid var(--border)",
					color: "var(--muted-foreground)",
				}}
			>
				{config.font}
			</span>
			<span
				className="inline-flex h-[18px] items-center rounded-full px-1.5 text-[9px] font-medium transition-all duration-300 motion-reduce:transition-none"
				style={{
					border: "1px solid var(--border)",
					color: "var(--muted-foreground)",
				}}
			>
				{config.iconLibrary}
			</span>
		</div>
	);
}
