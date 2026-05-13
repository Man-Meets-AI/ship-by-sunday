import type { CanonicalProjectFactKey } from "@shipbysunday/codebase-compiler";

export function CodebaseFieldCharacterCounter({
	budget,
	count,
	fieldKey,
	id,
}: {
	budget: number;
	count: number;
	fieldKey: CanonicalProjectFactKey;
	id: string;
}) {
	const guidance = budget < 200 ? "sentence" : "answer";
	return (
		<p
			id={id}
			className="text-xs leading-5 text-muted-foreground"
			data-testid={`codebase-page-field-budget-${fieldKey}`}
		>
			{count} characters - aim for one tight {guidance}.
		</p>
	);
}
