import { productConfig } from "@/config/product";

export function BonusCourseCard() {
	return (
		<aside className="rounded-none border border-product-border bg-product-surface/78 p-5 shadow-panel backdrop-blur-xl">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="max-w-3xl">
					<p className="font-mono text-[10px] uppercase tracking-[0.2em] text-product-muted">
						Included bonus
					</p>
					<h2 className="mt-3 font-display text-2xl uppercase leading-none tracking-[0.08em] text-product-text">
						{productConfig.bonusName}
					</h2>
					<p className="mt-3 text-sm leading-relaxed text-product-muted">
						Use this optional playlist when product judgment feels shaky: what
						to build first, what to cut, and how to keep the v1 small enough to
						ship.
					</p>
				</div>
				<span className="inline-flex rounded-none border border-product-border bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
					Optional
				</span>
			</div>

			<div className="mt-4 border border-product-border/60 bg-product-surface-strong/72 p-4">
				<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
					Best used for
				</p>
				<p className="mt-2 text-sm leading-relaxed text-product-text">
					Open it if you are second-guessing scope, user, prioritization, or how
					to decide what the real v1 should be.
				</p>
				<p className="mt-2 text-xs leading-relaxed text-product-muted">
					Do not pause the sprint to binge it. Start Here still comes first.
				</p>
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-3">
				<a
					href={productConfig.bonusPlaylistUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt"
				>
					Open YouTube playlist
				</a>
				<p className="text-xs leading-relaxed text-product-muted">
					Keep moving through the sprint. This is here when you need clearer
					product judgment.
				</p>
			</div>
		</aside>
	);
}
