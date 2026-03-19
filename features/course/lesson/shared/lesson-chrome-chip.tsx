import { cn } from "@/lib/utils";

type LessonChromeChipStatus = "completed" | "active" | "ready" | "locked";

function chipStatusClass(status: LessonChromeChipStatus) {
	switch (status) {
		case "completed":
			return "border-product-border bg-product-surface text-product-text";
		case "active":
			return "border-product-accent bg-product-chip text-product-accent shadow-[0_0_0_1px_var(--product-accent)]";
		case "ready":
			return "border-product-border bg-product-surface-alt/90 text-product-text";
		case "locked":
			return "border-product-border/40 bg-product-surface-strong/40 text-product-muted opacity-60";
	}
}

function LessonChromeChipIcon({ status }: { status: LessonChromeChipStatus }) {
	if (status === "completed") {
		return (
			<svg
				width="10"
				height="10"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		);
	}

	if (status === "active") {
		return <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />;
	}

	if (status === "ready") {
		return <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full border border-current" />;
	}

	return (
		<svg
			width="10"
			height="10"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className="opacity-60"
		>
			<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</svg>
	);
}

export function LessonChromeChip({
	status,
	label,
	className,
}: {
	status: LessonChromeChipStatus;
	label: string;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-none border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em]",
				chipStatusClass(status),
				className,
			)}
		>
			<span>{label}</span>
			<LessonChromeChipIcon status={status} />
		</span>
	);
}
