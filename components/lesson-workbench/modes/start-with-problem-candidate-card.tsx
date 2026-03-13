type Signal = {
	label: string;
	ok: boolean;
	help: string;
};

export function StartWithProblemCandidateCard({
	index,
	owner,
	pain,
	signals,
}: {
	index: number;
	owner: string;
	pain: string;
	signals: Signal[];
}) {
	const readyCount = signals.filter((signal) => signal.ok).length;

	return (
		<div className="border border-product-border/60 bg-product-surface px-3 py-3">
			<div className="flex items-center justify-between gap-2">
				<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
					Candidate {index}
				</p>
				<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
					{readyCount}/3 good signs
				</p>
			</div>
			<p className="mt-2 font-display text-sm uppercase tracking-[0.04em] text-product-text">
				{owner || "Add who has this problem"}
			</p>
			<p className="mt-2 min-h-[72px] text-[12px] leading-relaxed text-product-muted">
				{pain || "Add the recurring pain this person keeps running into."}
			</p>
			<div className="mt-3 space-y-2 border-t border-product-border/60 pt-3">
				{signals.map((signal) => (
					<div key={signal.label} className="space-y-0.5">
						<p className="font-mono text-[9px] uppercase tracking-[0.14em] text-product-muted">
							{signal.label}
						</p>
						<p
							className={`text-[11px] leading-relaxed ${
								signal.ok ? "text-product-text" : "text-product-muted"
							}`}
						>
							{signal.help}
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
