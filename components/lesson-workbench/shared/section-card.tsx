import type { WorkbenchSection } from "@/lib/course/manifest";

export function SectionCard({
	section,
	children,
	isComplete,
	blocked = false,
	blockedMessage,
}: {
	section: WorkbenchSection;
	children: React.ReactNode;
	isComplete: boolean;
	blocked?: boolean;
	blockedMessage?: string;
}) {
	return (
		<section
			className={`rounded-none border border-product-border/70 ${
				blocked ? "bg-product-surface/35" : "bg-product-surface/55"
			}`}
		>
			<div className="border-b border-product-border/60 px-4 py-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="space-y-1">
						{section.eyebrow ? (
							<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
								{section.eyebrow}
							</p>
						) : null}
						<h2 className="font-display text-base uppercase tracking-[0.04em] text-product-text">
							{section.title}
						</h2>
					</div>
					<span className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
						{blocked ? "Locked" : isComplete ? "Ready" : "In progress"}
					</span>
				</div>
				{blocked && blockedMessage ? (
					<p className="mt-2 max-w-2xl text-[12px] font-medium leading-relaxed text-product-muted">
						{blockedMessage}
					</p>
				) : null}
				{section.instruction ? (
					<p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-product-muted">
						{section.instruction}
					</p>
				) : null}
			</div>
			<div className="px-4 py-4">
				<fieldset disabled={blocked} className={blocked ? "opacity-45" : ""}>
					{children}
				</fieldset>
			</div>
		</section>
	);
}
