"use client";

import { workbenchChromeLabelClass } from "../../shared/workbench-readability";

function getChoiceClass(selected: boolean, invalid: boolean, disabled = false) {
	if (disabled) {
		return "border-product-border/50 bg-product-surface text-product-muted opacity-80";
	}

	if (selected) {
		return "border-product-accent/45 bg-product-accent/[0.08] text-product-text";
	}

	if (invalid) {
		return "border-danger bg-danger/[0.06] text-product-text";
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
		<div className="grid gap-4 md:grid-cols-2">
			<div
				className={`border px-4 py-4 ${getChoiceClass(
					currentPath === "Use template",
					invalid,
					!templateRepoUrl,
				)}`}
			>
				<p className={workbenchChromeLabelClass}>Use template repo</p>
				<p className="mt-3 text-[15px] font-semibold leading-[1.4]">
					Start from the shared setup and move straight into implementation.
				</p>
				<p className="mt-3 text-[13px] leading-[1.7] text-product-muted">
					Best when you want setup handled so you can focus on the first real
					slice.
				</p>
				<div className="mt-3 flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={() => onChoosePath("Use template")}
						disabled={!templateRepoUrl}
						className="inline-flex border border-product-accent bg-product-chip px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
					>
						Choose template
					</button>
					{templateRepoUrl ? (
						<a
							href={templateRepoUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex border border-product-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt"
						>
							Open template
						</a>
					) : null}
				</div>
				{!templateRepoUrl ? (
					<p className="mt-3 text-[13px] leading-[1.7] text-product-muted">
						Template repo not connected yet. Continue with custom path or
						connect it now.
					</p>
				) : null}
			</div>
			<div
				className={`border px-4 py-4 ${getChoiceClass(
					currentPath === "Custom path",
					invalid,
				)}`}
			>
				<p className={workbenchChromeLabelClass}>Use your current repo</p>
				<p className="mt-3 text-[15px] font-semibold leading-[1.4]">
					Keep your existing stack and scope the prompt to your current
					codebase.
				</p>
				<p className="mt-3 text-[13px] leading-[1.7] text-product-muted">
					Best when you already have a starter, an existing repo, or a stack you
					need to preserve.
				</p>
				<div className="mt-3">
					<button
						type="button"
						onClick={() => onChoosePath("Custom path")}
						className="inline-flex border border-product-border bg-product-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt"
					>
						Choose custom path
					</button>
				</div>
			</div>
		</div>
	);
}

export function PathChoiceValidationMessage({ invalid }: { invalid: boolean }) {
	if (!invalid) {
		return null;
	}

	return (
		<p className="mt-3 text-[12px] font-medium leading-[1.6] text-danger">
			Choose a starting path before continuing.
		</p>
	);
}
