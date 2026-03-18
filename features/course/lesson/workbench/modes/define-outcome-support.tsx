import { WorkbenchCard } from "../shared/workbench-card";

const FEATURE_LANGUAGE_PATTERN =
	/\b(app|tool|platform|dashboard|feature|features|ai|workflow|system)\b/i;

function getTextValue(fieldValues: Record<string, unknown>, fieldId: string) {
	const value = fieldValues[fieldId];
	return typeof value === "string" ? value.trim() : "";
}

export function DefineOutcomeSupport({
	fieldValues,
}: {
	fieldValues: Record<string, unknown>;
}) {
	const outcome = getTextValue(fieldValues, "outcome");
	const successLooksLike = getTextValue(fieldValues, "success_looks_like");
	const differenceForUser = getTextValue(fieldValues, "difference_for_user");
	const outcomeLooksFeatureHeavy =
		outcome.length > 0 && FEATURE_LANGUAGE_PATTERN.test(outcome);
	const previewLines = [
		{
			label: "Promised outcome",
			filled: Boolean(outcome),
			value:
				outcome || "State the changed condition for the user in one sentence.",
		},
		{
			label: "Observable proof",
			filled: Boolean(successLooksLike),
			value:
				successLooksLike ||
				"Show what the user can now do or finish when this works.",
		},
		{
			label: "Pain removed",
			filled: Boolean(differenceForUser),
			value:
				differenceForUser ||
				"Describe what becomes easier or stops hurting for them.",
		},
	];

	return (
		<div className="space-y-3">
			<WorkbenchCard label="Turn features into outcomes">
				<div className="space-y-3 text-[12px] leading-relaxed text-product-text">
					<p>
						Define one promise you can pressure-test next in{" "}
						<code className="mx-1 font-mono">1.4</code>. The goal is the user’s
						changed state, not the app inventory.
					</p>
					<div className="grid gap-3 md:grid-cols-2">
						<div className="border border-product-border/60 bg-product-surface px-3 py-3">
							<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
								Weak example
							</p>
							<p className="mt-2 text-product-muted">
								AI app that summarizes meetings, organizes notes, and generates
								next steps.
							</p>
						</div>
						<div className="border border-product-accent/45 bg-product-chip/45 px-3 py-3">
							<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
								Stronger rewrite
							</p>
							<p className="mt-2">
								Startup operators leave a meeting with a clean action summary
								they can review and send in minutes.
							</p>
						</div>
					</div>
					<ul className="grid gap-2 md:grid-cols-3">
						{[
							"Promised outcome: the one result the product should make true.",
							"Observable proof: what the user can now do or finish.",
							"Pain removed: what gets easier or stops hurting.",
						].map((item) => (
							<li
								key={item}
								className="border border-product-border/60 bg-product-surface px-3 py-2"
							>
								{item}
							</li>
						))}
					</ul>
					{outcomeLooksFeatureHeavy ? (
						<p className="text-[11px] font-medium leading-relaxed text-product-accent">
							This draft still reads feature-heavy. Rewrite it as what changes
							for the user after the product works.
						</p>
					) : null}
				</div>
			</WorkbenchCard>
			<WorkbenchCard label="Outcome statement preview">
				<div className="space-y-3 text-[12px] leading-relaxed text-product-text">
					<p>
						This is the promise <code className="mx-1 font-mono">1.4</code> will
						pressure-test next.
					</p>
					<div className="space-y-3 border border-product-border/60 bg-product-surface px-4 py-4">
						{previewLines.map((line) => (
							<div key={line.label}>
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-muted">
									{line.label}
								</p>
								<p
									className={`mt-1 ${line.filled ? "text-product-text" : "text-product-muted"}`}
								>
									{line.value}
								</p>
							</div>
						))}
					</div>
					<p className="text-[11px] text-product-muted">
						Next step: find evidence that this outcome matters in the real
						world, not just on paper.
					</p>
				</div>
			</WorkbenchCard>
		</div>
	);
}
