import { Fragment, type ReactNode } from "react";

const codeClass =
	"rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground";

/**
 * Renders checklist option copy, turning `backtick` segments into inline code.
 */
export function renderChecklistLabel(label: string): ReactNode {
	const parts = label.split("`");
	if (parts.length === 1) {
		return label;
	}

	return parts.map((part, index) =>
		index % 2 === 0 ? (
			<Fragment key={index}>{part}</Fragment>
		) : (
			<code key={index} className={codeClass}>
				{part}
			</code>
		),
	);
}
