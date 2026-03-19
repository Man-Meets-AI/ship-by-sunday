import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { Textarea } from "@/components/ui/textarea";
import { WorkbenchCard } from "../../shared/workbench-card";

type ScopeRationaleCardProps = {
	field: WorkbenchField;
	value: string;
	chosenUser: string | null;
	promisedOutcome: string | null;
	invalidMessage?: string;
	onChange: (value: string) => void;
};

export function ScopeRationaleCard({
	field,
	value,
	chosenUser,
	promisedOutcome,
	invalidMessage,
	onChange,
}: ScopeRationaleCardProps) {
	const isReady = value.trim().length > 0;
	const formulaHint =
		chosenUser && promisedOutcome
			? `Anchor it to ${chosenUser} still reaching: ${promisedOutcome}`
			: "Explain why the stripped-down version still gets the user to the promised win.";

	return (
		<WorkbenchCard label={`3. ${field.label}`}>
			<div className="space-y-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div className="max-w-2xl space-y-1">
						<p className="text-sm leading-relaxed text-product-text">
							Write the shortest believable defense for why this smaller version
							is still enough.
						</p>
						<p className="text-[11px] leading-relaxed text-product-muted">
							{formulaHint}
						</p>
					</div>
					<span
						className={`inline-flex items-center border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
							isReady
								? "border-product-accent/40 bg-product-accent/[0.08] text-product-accent"
								: "border-product-border bg-product-surface text-product-text"
						}`}
					>
						{isReady ? "Ready" : "Still needed"}
					</span>
				</div>

				<Textarea
					value={value}
					onChange={(event) => onChange(event.target.value)}
					rows={field.rows ?? 4}
					placeholder={
						field.placeholder ??
						"This is enough because the user can still get the promised win through one clean core flow this weekend."
					}
					className="font-mono"
				/>

				<p className="text-[11px] leading-relaxed text-product-muted">
					Do not write a roadmap. Write why this reduced version still delivers
					a believable first win.
				</p>

				{invalidMessage ? (
					<p className="text-[11px] font-medium leading-snug text-danger">
						{invalidMessage}
					</p>
				) : null}
			</div>
		</WorkbenchCard>
	);
}
