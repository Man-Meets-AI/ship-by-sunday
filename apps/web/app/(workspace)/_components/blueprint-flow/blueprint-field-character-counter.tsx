import type { CanonicalProjectFactKey } from "@shipbysunday/blueprint-compiler";

export function BlueprintFieldCharacterCounter({
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
			data-testid={`blueprint-page-field-budget-${fieldKey}`}
		>
			{count} characters - aim for one tight {guidance}.
		</p>
	);
}
