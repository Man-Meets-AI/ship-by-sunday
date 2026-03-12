"use client";

import { WorkbenchCard } from "../../shared/workbench-card";

function getChoiceClass(selected: boolean, invalid: boolean, disabled = false) {
	if (disabled) {
		return "border-product-border/50 bg-product-surface text-product-muted opacity-80";
	}

	if (selected) {
		return "border-product-accent/45 bg-product-accent/[0.08] text-product-text";
	}

	if (invalid) {
		return "border-[#a83232] bg-[rgba(168,50,50,0.06)] text-product-text";
	}

	return "border-product-border/70 bg-product-surface text-product-text";
}

export function PathChoiceCard({
	currentPath,
	invalid,
	templateRepoUrl,
	onChoosePath,
}: {
	currentPath: string | null;
	invalid: boolean;
	templateRepoUrl: string | null;
	onChoosePath: (path: "Use template" | "Custom path") => void;
}) {
	return (
		<WorkbenchCard label="Starting path">
			<div className="grid gap-2 md:grid-cols-2">
				<div
					className={`border px-3 py-3 ${getChoiceClass(
						currentPath === "Use template",
						invalid,
						!templateRepoUrl,
					)}`}
				>
					<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						Use template
					</p>
					<p className="mt-2 text-sm font-medium leading-snug">
						Start from the shared repo and move straight into implementation.
					</p>
					<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
						Best when you want the boring setup handled so you can focus on the
						first real slice.
					</p>
					<div className="mt-3">
						{templateRepoUrl ? (
							<button
								type="button"
								onClick={() => {
									onChoosePath("Use template");
									window.open(templateRepoUrl, "_blank", "noopener,noreferrer");
								}}
								className="inline-flex border border-product-accent bg-product-chip px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
							>
								Use template
							</button>
						) : (
							<p className="text-[11px] leading-relaxed text-product-muted">
								Starter repo link is not configured yet.
							</p>
						)}
					</div>
				</div>
				<div
					className={`border px-3 py-3 ${getChoiceClass(
						currentPath === "Custom path",
						invalid,
					)}`}
				>
					<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						Custom path
					</p>
					<p className="mt-2 text-sm font-medium leading-snug">
						Use your own repo or start clean, then let the prompt keep the work
						tight.
					</p>
					<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
						Best when you already have a starter, a current repo, or a different
						stack you need to respect.
					</p>
					<div className="mt-3">
						<button
							type="button"
							onClick={() => onChoosePath("Custom path")}
							className="inline-flex border border-product-border bg-product-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt"
						>
							Start custom path
						</button>
					</div>
				</div>
			</div>
			{invalid ? (
				<p className="mt-3 text-[11px] font-medium leading-snug text-[#a83232]">
					Choose a starting path before continuing.
				</p>
			) : null}
		</WorkbenchCard>
	);
}
